from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import logging
from typing import List, Optional
from pydantic import BaseModel, Field

# --- Configuração do Logging ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# --- Importação dos Módulos de Serviço ---
from services.supabase_client import supabase
from services.file_processor import processar_relatorio

# --- Modelos Pydantic (Tipagem de Dados) ---

class DeleteRequest(BaseModel):
    ids: List[int] = Field(..., example=[1, 2, 3], description="Lista de IDs dos clientes a serem excluídos.")

class MessageResponse(BaseModel):
    message: str = Field(..., example="Operação bem-sucedida.")

class UploadResponse(BaseModel):
    message: str = Field(..., example="Arquivo recebido! Processamento iniciado.")
    relatorio_id: int

class KpiStatsResponse(BaseModel):
    avg_offline_hours: Optional[float] = Field(None, example=72.5)
    city_with_most_offline: Optional[str] = Field(None, example="Apucarana")

# --- Configuração do App FastAPI ---
app = FastAPI(
    title="Dashboard ONUs API",
    description="API para processar relatórios de ONUs e identificar clientes offline.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Função de Processamento em Background ---
def processar_arquivo_em_background(relatorio_id: int, contents: bytes, filename: str):
    logger.info(f"Iniciando processamento em background para o relatório ID: {relatorio_id}")
    try:
        supabase.table('relatorios').update({"status": "PROCESSING"}).eq('id', relatorio_id).execute()
        
        df = pd.read_excel(io.BytesIO(contents)) if filename.endswith(('.xlsx', '.xls')) else pd.read_csv(
            io.BytesIO(contents), sep=None, engine='python', encoding='latin-1'
        )
        
        df.columns = (
            df.columns
            .str.strip()
            .str.lower()
            .str.replace(" ", "_")
            .str.replace("á", "a")
            .str.replace("ã", "a")
            .str.replace("â", "a")
            .str.replace("é", "e")
            .str.replace("ê", "e")
            .str.replace("í", "i")
            .str.replace("ó", "o")
            .str.replace("ô", "o")
            .str.replace("õ", "o")
            .str.replace("ú", "u")
            .str.replace("ç", "c")
        )

        # 🔎 Agora, garanta que o CSV tenha pelo menos as colunas necessárias
        required = ["status"]
        alternatives = ["ultima_comunicacao", "ultima_alteracao_de_status"]

        if not all(col in df.columns for col in required):
            raise Exception("Coluna obrigatória 'Status' não encontrada no arquivo.")
        
        if not any(col in df.columns for col in alternatives):
            raise Exception("Nenhuma coluna de data encontrada ('Ultima Comunicacao' ou 'Última Alteração de Status').")
        
        clientes_para_inserir = processar_relatorio(df, relatorio_id)
        
        if clientes_para_inserir:
            logger.info(f"Encontrados {len(clientes_para_inserir)} clientes offline para inserir no DB.")
            insert_res = supabase.table('clientes_off').insert(clientes_para_inserir).execute()
            if not insert_res.data:
                raise Exception("Falha ao salvar clientes no banco de dados.")
        else:
            logger.info(f"Nenhum cliente com status 'LOSS' encontrado no relatório ID: {relatorio_id}.")
        
        supabase.table('relatorios').update({"status": "COMPLETED"}).eq('id', relatorio_id).execute()
        logger.info(f"Processamento do relatório ID: {relatorio_id} concluído com sucesso.")

    except Exception as e:
        error_detail = f"Erro ao processar o arquivo: {str(e)}"
        logger.error(f"Falha no processamento do relatório (ID: {relatorio_id}). Erro: {error_detail}", exc_info=True)
        supabase.table('relatorios').update({"status": "FAILED", "detalhes_erro": error_detail}).eq('id', relatorio_id).execute()

# --- Rotas da API ---

@app.get("/", tags=["Status"], summary="Verifica a saúde da API")
def read_root():
    """Retorna um status simples para indicar que a API está online."""
    return {"status": "API online"}

@app.post("/upload", response_model=UploadResponse, tags=["Relatórios"], summary="Upload de novo relatório")
async def upload_relatorio(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """Recebe um arquivo, cria um registro e agenda o processamento em background."""
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Formato de arquivo inválido. Use Excel ou CSV.")
    
    contents = await file.read()
    
    insert_res = supabase.table('relatorios').insert({"nome_arquivo": file.filename, "status": "PENDING"}).execute()
    if not insert_res.data:
        raise HTTPException(status_code=500, detail="Não foi possível criar o registro do relatório.")
    
    relatorio_id = insert_res.data[0]['id']
    background_tasks.add_task(processar_arquivo_em_background, relatorio_id, contents, file.filename)
    
    return {"message": "Arquivo recebido! O processamento foi iniciado.", "relatorio_id": relatorio_id}

@app.get("/stats/kpis", response_model=KpiStatsResponse, tags=["Estatísticas"], summary="Busca os KPIs principais")
def get_main_kpis():
    """Retorna os principais KPIs: tempo médio offline e cidade com mais quedas."""
    try:
        response = supabase.rpc('get_dashboard_kpis').execute()
        if response.data:
            return response.data[0]
        return KpiStatsResponse()
    except Exception as e:
        logger.error(f"Erro ao buscar KPIs em /stats/kpis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erro interno ao buscar KPIs.")

@app.get("/stats/clients-by-city", tags=["Estatísticas"], summary="Clientes offline por cidade")
def get_clients_by_city():
    """Retorna a contagem de clientes offline agrupados por cidade."""
    try:
        response = supabase.rpc('get_clients_by_city').execute()
        return response.data
    except Exception as e:
        logger.error(f"Erro em /stats/clients-by-city: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erro ao buscar dados por cidade.")

@app.get("/stats/offline-history", tags=["Estatísticas"], summary="Histórico de clientes offline")
def get_offline_history():
    """Retorna a contagem de novos clientes offline por dia."""
    try:
        response = supabase.rpc('get_offline_history').execute()
        return response.data
    except Exception as e:
        logger.error(f"Erro em /stats/offline-history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erro ao buscar histórico.")

@app.delete("/clients/all", response_model=MessageResponse, tags=["Clientes"], summary="Exclui todos os clientes")
def delete_all_clients():
    """Exclui TODOS os registros da tabela 'clientes_off'."""
    try:
        delete_res = supabase.table('clientes_off').delete().neq('id', 0).execute()
        count = len(delete_res.data)
        return {"message": f"{count} registros foram excluídos com sucesso."}
    except Exception as e:
        logger.error(f"Erro ao excluir todos os clientes: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro ao excluir registros: {e}")

@app.delete("/clients", response_model=MessageResponse, tags=["Clientes"], summary="Exclui clientes selecionados")
def delete_selected_clients(request: DeleteRequest):
    """Exclui registros da tabela 'clientes_off' com base em uma lista de IDs."""
    if not request.ids:
        raise HTTPException(status_code=400, detail="Nenhum ID foi fornecido.")
    try:
        delete_res = supabase.table('clientes_off').delete().in_('id', request.ids).execute()
        count = len(delete_res.data)
        return {"message": f"{count} registros selecionados foram excluídos."}
    except Exception as e:
        logger.error(f"Erro ao excluir clientes selecionados: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro ao excluir registros: {e}")

