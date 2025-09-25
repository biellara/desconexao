from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import logging
from typing import List
from pydantic import BaseModel, Field

# --- Configuração do Logging ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# --- Importa os nossos módulos de serviço ---
from services.supabase_client import supabase
from services.file_processor import processar_relatorio

# --- Modelos Pydantic (sem alterações) ---

class DeleteRequest(BaseModel):
    ids: List[int] = Field(..., example=[1, 2, 3], description="Lista de IDs dos clientes a serem excluídos.")

class StatusResponse(BaseModel):
    status: str = Field(..., example="API online")

class MessageResponse(BaseModel):
    message: str = Field(..., example="Operação realizada com sucesso.")

class UploadResponse(BaseModel):
    message: str = Field(..., example="Arquivo recebido! O processamento foi iniciado em segundo plano.")
    relatorio_id: int = Field(..., example=42)


# --- Configuração do App FastAPI ---
app = FastAPI(
    title="Dashboard ONUs API",
    description="API para processar relatórios de ONUs e identificar clientes offline.",
    version="0.4.0" # Versão incrementada
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
    logger.info(f"Iniciando processamento em background para o relatório ID: {relatorio_id}, Arquivo: {filename}")
    try:
        supabase.table('relatorios').update({"status": "PROCESSING"}).eq('id', relatorio_id).execute()
        logger.info(f"Status do relatório ID: {relatorio_id} atualizado para PROCESSING.")

        if filename.endswith('.csv'):
            try:
                df = pd.read_csv(io.BytesIO(contents), sep=None, engine='python')
            except Exception:
                df = pd.read_csv(io.BytesIO(contents), sep=';', encoding='latin-1')
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        clientes_para_inserir = processar_relatorio(df, relatorio_id)
        
        if clientes_para_inserir:
            logger.info(f"Encontrados {len(clientes_para_inserir)} clientes offline para inserir no relatório ID: {relatorio_id}.")
            insert_clientes_res = supabase.table('clientes_off').insert(clientes_para_inserir).execute()
            if not insert_clientes_res.data:
                 raise Exception("Erro ao salvar os clientes offline no banco de dados.")
        else:
            logger.info(f"Nenhum cliente offline (>48h) encontrado no relatório ID: {relatorio_id}.")

        supabase.table('relatorios').update({"status": "COMPLETED"}).eq('id', relatorio_id).execute()
        logger.info(f"Processamento do relatório ID: {relatorio_id} concluído com sucesso (COMPLETED).")

    except Exception as e:
        error_detail = f"Erro ao processar o arquivo: {str(e)}"
        logger.error(f"Falha no processamento do relatório ID: {relatorio_id}. Erro: {error_detail}")
        supabase.table('relatorios').update({
            "status": "FAILED",
            "detalhes_erro": error_detail
        }).eq('id', relatorio_id).execute()


# --- Rotas da API ---

@app.get("/", response_model=StatusResponse)
def read_root():
    """Verifica o status da API."""
    logger.info("Rota raiz ('/') foi acessada.")
    return {"status": "API online"}

@app.post("/upload", response_model=UploadResponse)
async def upload_relatorio(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Recebe um arquivo, cria um registro de relatório e agenda o processamento.
    """
    logger.info(f"Recebido arquivo para upload: {file.filename} ({round(len(await file.read()) / 1024, 2)} KB)")
    await file.seek(0) # Retorna ao início do arquivo após a leitura do tamanho

    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        logger.warning(f"Upload rejeitado: formato de arquivo inválido ({file.filename}).")
        raise HTTPException(status_code=400, detail="Formato de arquivo inválido. Use Excel ou CSV.")

    contents = await file.read()

    try:
        insert_relatorio_res = supabase.table('relatorios').insert({
            "nome_arquivo": file.filename,
            "tamanho_arquivo_kb": int(len(contents) / 1024),
            "status": "PENDING"
        }).execute()

        if not insert_relatorio_res.data:
            logger.error("Falha ao criar o registro do relatório no Supabase.")
            raise HTTPException(status_code=500, detail="Não foi possível criar o registro do relatório.")
        
        relatorio_id = insert_relatorio_res.data[0]['id']
        logger.info(f"Registro do relatório criado com ID: {relatorio_id}. Agendando tarefa em background.")

        background_tasks.add_task(processar_arquivo_em_background, relatorio_id, contents, file.filename)

        return {
            "message": "Arquivo recebido! O processamento foi iniciado em segundo plano.",
            "relatorio_id": relatorio_id
        }

    except Exception as e:
        logger.error(f"Erro inesperado na rota /upload: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro inesperado ao iniciar o upload: {str(e)}")


@app.delete("/clients/all", response_model=MessageResponse)
def delete_all_clients():
    """Exclui TODOS os registros da tabela 'clientes_off'."""
    logger.info("Requisição para excluir todos os clientes recebida.")
    try:
        delete_res = supabase.table('clientes_off').delete().neq('id', 0).execute()
        count = len(delete_res.data)
        logger.info(f"{count} registros de clientes foram excluídos com sucesso.")
        return {"message": f"{count} registros foram excluídos com sucesso."}
    except Exception as e:
        logger.error(f"Erro ao excluir todos os clientes: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro ao excluir todos os registros: {str(e)}")

@app.delete("/clients", response_model=MessageResponse)
def delete_selected_clients(request: DeleteRequest):
    """Exclui registros da tabela 'clientes_off' com base em uma lista de IDs."""
    ids = request.ids
    logger.info(f"Requisição para excluir {len(ids)} clientes recebida. IDs: {ids}")
    if not ids:
        logger.warning("Tentativa de exclusão sem fornecer IDs.")
        raise HTTPException(status_code=400, detail="Nenhum ID foi fornecido para exclusão.")
    
    try:
        delete_res = supabase.table('clientes_off').delete().in_('id', ids).execute()
        count = len(delete_res.data)
        logger.info(f"{count} registros de clientes selecionados foram excluídos com sucesso.")
        return {"message": f"{count} registros selecionados foram excluídos com sucesso."}
    except Exception as e:
        logger.error(f"Erro ao excluir clientes selecionados: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro ao excluir registros selecionados: {str(e)}")

