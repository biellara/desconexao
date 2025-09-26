from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import logging
import os # Importar a biblioteca os
from typing import List, Optional
from pydantic import BaseModel, Field
import httpx

# --- Configuração do Logging ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# --- Importação dos Módulos de Serviço ---
from backend.services.supabase_client import supabase
from backend.services.file_processor import processar_relatorio

# --- Carregar o Token do ERP do ambiente ---
ERP_TOKEN = os.getenv("ERP_API_TOKEN")
if not ERP_TOKEN:
    logger.warning("A variável de ambiente ERP_API_TOKEN não está definida. A integração com o ERP pode falhar.")


# --- Modelos Pydantic (Tipagem de Dados) ---
class ErpRequest(BaseModel):
    client_name: str = Field(..., example="GABRIEL DIAS DE LARA")

class DeleteRequest(BaseModel):
    ids: List[int] = Field(..., example=[1, 2, 3])

class MessageResponse(BaseModel):
    message: str = Field(..., example="Operação bem-sucedida.")

class UploadResponse(BaseModel):
    message: str = Field(..., example="Arquivo recebido! Processamento iniciado.")
    relatorio_id: int

class NewKpiStatsResponse(BaseModel):
    new_critical_cases_24h: Optional[int] = Field(None, example=15)
    most_critical_olt: Optional[str] = Field(None, example="OLT-APU-FH-COLONIAL")
    oldest_case_days: Optional[int] = Field(None, example=12)

class ReportStatusResponse(BaseModel):
    status: str
    detalhes_erro: Optional[str] = None


# --- Configuração do App FastAPI ---
app = FastAPI(
    title="Dashboard ONUs API",
    description="API para processar relatórios de ONUs e identificar clientes offline.",
    version="1.2.1"
)

# Lista de domínios autorizados a aceder à sua API
origins = [
    "https://desconexao.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "PUT"],
    allow_headers=["*"],
)


# --- Rota de Integração com ERP (Atualizada com Autenticação) ---
@app.post("/erp/create-attendance", response_model=MessageResponse, tags=["ERP"], summary="Cria um atendimento no ERP")
async def create_erp_attendance(request: ErpRequest):
    if not ERP_TOKEN:
        raise HTTPException(status_code=500, detail="Token da API do ERP não configurado no servidor.")

    ERP_BASE_URL = "https://erp.iredinternet.com.br:45701/api/v1/Projects/Attendance"
    client_name_encoded = request.client_name.replace(" ", "%20")
    
    # 2. Criar o cabeçalho de autenticação
    auth_headers = {"Authorization": f"Bearer {ERP_TOKEN}"}
    
    try:
        async with httpx.AsyncClient() as client:
            # Passo 1: Buscar o ID do cliente no ERP
            find_people_url = f"{ERP_BASE_URL}/FindPeople?Page=1&PageSize=1&search={client_name_encoded}"
            logger.info(f"Buscando cliente no ERP: {find_people_url}")
            
            # 3. Usar os headers na requisição
            erp_response = await client.get(find_people_url, headers=auth_headers, timeout=10.0)
            erp_response.raise_for_status()
            
            response_data = erp_response.json()
            
            clients_found = response_data.get("response", {}).get("data", [])
            if not clients_found:
                raise HTTPException(status_code=404, detail=f"Cliente '{request.client_name}' não encontrado no ERP.")

            client_id = clients_found[0].get("id")
            if not client_id:
                raise HTTPException(status_code=404, detail="ID do cliente não encontrado na resposta do ERP.")
                
            logger.info(f"Cliente '{request.client_name}' encontrado com ID: {client_id}")

            # Passo 5: Criar a solicitação de atendimento
            create_solicitation_url = f"{ERP_BASE_URL}/CreateDefaultSolicitation/{client_id}"
            logger.info(f"Criando solicitação no ERP para o ID {client_id}")
            
            # 3. Usar os headers na requisição
            create_response = await client.put(
                create_solicitation_url,
                json={"clientId": client_id},
                headers=auth_headers,
                timeout=10.0
            )
            create_response.raise_for_status()
            
            logger.info(f"Solicitação criada com sucesso para o cliente ID {client_id}")

        return {"message": f"Atendimento para '{request.client_name}' criado com sucesso no ERP."}

    except httpx.HTTPStatusError as e:
        error_body = e.response.text
        logger.error(f"Erro de comunicação com a API do ERP ({e.response.status_code}): {error_body}")
        raise HTTPException(status_code=e.response.status_code, detail=f"Erro ao comunicar com o ERP: {error_body}")
    except Exception as e:
        logger.error(f"Erro inesperado na integração com ERP: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Ocorreu um erro inesperado na integração: {str(e)}")


# --- Demais Rotas (sem alterações) ---

@app.get("/", tags=["Status"])
def read_root():
    return {"status": "API online"}

def processar_arquivo_em_background(relatorio_id: int, contents: bytes, filename: str):
    logger.info(f"Iniciando processamento em background para o relatório ID: {relatorio_id}")
    try:
        supabase.table('relatorios').update({"status": "PROCESSING"}).eq('id', relatorio_id).execute()
        
        df = pd.read_excel(io.BytesIO(contents)) if filename.endswith(('.xlsx', '.xls')) else pd.read_csv(
            io.BytesIO(contents), sep=None, engine='python', encoding='latin-1'
        )
        
        df.columns = (
            df.columns.str.strip().str.lower()
            .str.replace(" ", "_").str.replace("á", "a").str.replace("ã", "a")
            .str.replace("â", "a").str.replace("é", "e").str.replace("ê", "e")
            .str.replace("í", "i").str.replace("ó", "o").str.replace("ô", "o")
            .str.replace("õ", "o").str.replace("ú", "u").str.replace("ç", "c")
        )

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
        supabase.table('relatorios').update(
            {"status": "FAILED", "detalhes_erro": error_detail}
        ).eq('id', relatorio_id).execute()


@app.get("/relatorios/status/{relatorio_id}", response_model=ReportStatusResponse, tags=["Relatórios"])
def get_report_status(relatorio_id: int):
    try:
        res = supabase.table("relatorios").select("status, detalhes_erro").eq("id", relatorio_id).single().execute()
        if res.data:
            return res.data
        raise HTTPException(status_code=404, detail="Relatório não encontrado.")
    except Exception as e:
        logger.error(f"Erro ao buscar status do relatório {relatorio_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro ao consultar o estado do relatório.")

@app.post("/upload", response_model=UploadResponse, tags=["Relatórios"], summary="Upload de novo relatório")
async def upload_relatorio(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Formato de arquivo inválido. Use Excel ou CSV.")
    
    contents = await file.read()
    
    insert_res = supabase.table('relatorios').insert({
        "nome_arquivo": file.filename,
        "status": "PENDING"
    }).execute()

    if not insert_res.data:
        raise HTTPException(status_code=500, detail="Não foi possível criar o registro do relatório.")
    
    relatorio_id = insert_res.data[0]['id']
    background_tasks.add_task(processar_arquivo_em_background, relatorio_id, contents, file.filename)
    
    return {"message": "Arquivo recebido! O processamento foi iniciado.", "relatorio_id": relatorio_id}

@app.get("/stats/kpis", response_model=NewKpiStatsResponse, tags=["Estatísticas"], summary="Busca os KPIs principais")
def get_main_kpis():
    try:
        response = supabase.rpc('get_new_dashboard_kpis').execute()
        if response.data:
            return response.data[0]
        return NewKpiStatsResponse()
    except Exception as e:
        logger.error(f"Erro ao buscar KPIs em /stats/kpis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erro interno ao buscar KPIs.")

@app.get("/stats/clients-by-city", tags=["Estatísticas"])
def get_clients_by_city():
    try:
        response = supabase.rpc('get_clients_by_city').execute()
        return response.data
    except Exception as e:
        logger.error(f"Erro em /stats/clients-by-city: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erro ao buscar dados por cidade.")

@app.get("/stats/offline-history", tags=["Estatísticas"])
def get_offline_history():
    try:
        response = supabase.rpc('get_offline_history').execute()
        return response.data
    except Exception as e:
        logger.error(f"Erro em /stats/offline-history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erro ao buscar histórico.")

@app.delete("/clients/all", response_model=MessageResponse, tags=["Clientes"])
def delete_all_clients():
    try:
        delete_res = supabase.table('clientes_off').delete().neq('id', 0).execute()
        count = len(delete_res.data)
        return {"message": f"{count} registros foram excluídos com sucesso."}
    except Exception as e:
        logger.error(f"Erro ao excluir todos os clientes: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro ao excluir registros: {e}")

@app.delete("/clients", response_model=MessageResponse, tags=["Clientes"])
def delete_selected_clients(request: DeleteRequest):
    if not request.ids:
        raise HTTPException(status_code=400, detail="Nenhum ID foi fornecido.")
    try:
        delete_res = supabase.table('clientes_off').delete().in_('id', request.ids).execute()
        count = len(delete_res.data)
        return {"message": f"{count} registros selecionados foram excluídos."}
    except Exception as e:
        logger.error(f"Erro ao excluir clientes selecionados: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro ao excluir registros: {e}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)