from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import logging
import os
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
# Ajuste nos imports para refletir a estrutura correta de pacotes
from backend.services.supabase_client import supabase
from backend.services.file_processor import processar_relatorio

# --- Carregar o Token do ERP do ambiente ---
ERP_TOKEN = os.getenv("ERP_API_TOKEN")
if not ERP_TOKEN:
    logger.warning("A variável de ambiente ERP_API_TOKEN não está definida. A integração com o ERP pode falhar.")


# --- Modelos Pydantic (Tipagem de Dados) ---
class ErpRequest(BaseModel):
    client_name: str = Field(..., example="GABRIEL DIAS DE LARA")

# NOVO MODELO DE RESPOSTA para o ID do cliente
class ErpClientResponse(BaseModel):
    client_id: int = Field(..., example=337)
    client_name: str

class DeleteRequest(BaseModel):
    ids: List[int] = Field(..., example=[1, 2, 3])

class MessageResponse(BaseModel):
    message: str = Field(..., example="Operação bem-sucedida.")

# ... (outros modelos Pydantic sem alteração) ...
class UploadResponse(BaseModel):
    message: str
    relatorio_id: int

class NewKpiStatsResponse(BaseModel):
    new_critical_cases_24h: Optional[int]
    most_critical_olt: Optional[str]
    oldest_case_days: Optional[int]

class ReportStatusResponse(BaseModel):
    status: str
    detalhes_erro: Optional[str] = None


# --- Configuração do App FastAPI ---
app = FastAPI(
    title="Dashboard ONUs API",
    description="API para processar relatórios de ONUs e identificar clientes offline.",
    version="1.3.0" # Versão atualizada
)

origins = [
    "https://desconexao.vercel.app",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- ROTA DO ERP ATUALIZADA (Opção 1) ---
@app.post("/erp/find-client", response_model=ErpClientResponse, tags=["ERP"], summary="Encontra o ID de um cliente no ERP")
async def find_erp_client(request: ErpRequest):
    if not ERP_TOKEN:
        raise HTTPException(status_code=500, detail="Token da API do ERP não configurado no servidor.")

    ERP_BASE_URL = "https://erp.iredinternet.com.br:45701/api/v1/Projects/Attendance"
    client_name_encoded = request.client_name.replace(" ", "%20")
    
    auth_headers = {"Authorization": f"Bearer {ERP_TOKEN}"}
    
    try:
        async with httpx.AsyncClient() as client:
            find_people_url = f"{ERP_BASE_URL}/FindPeople?Page=1&PageSize=1&search={client_name_encoded}"
            logger.info(f"Buscando cliente no ERP: {find_people_url}")
            
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
            
            # Retorna o ID e o nome para o frontend
            return ErpClientResponse(client_id=client_id, client_name=request.client_name)

    except httpx.HTTPStatusError as e:
        error_body = e.response.text
        logger.error(f"Erro de comunicação com a API do ERP ({e.response.status_code}): {error_body}")
        raise HTTPException(status_code=e.response.status_code, detail=f"Erro ao comunicar com o ERP.")
    except Exception as e:
        logger.error(f"Erro inesperado na integração com ERP: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Ocorreu um erro inesperado na integração.")


# --- Demais Rotas (sem alterações) ---

@app.get("/", tags=["Status"])
def read_root():
    return {"status": "API online"}

# ... (todas as outras rotas como /upload, /stats/*, /clients/* continuam aqui sem alterações)
def processar_arquivo_em_background(relatorio_id: int, contents: bytes, filename: str):
    # ... (código existente)
    pass

@app.get("/relatorios/status/{relatorio_id}", response_model=ReportStatusResponse, tags=["Relatórios"])
def get_report_status(relatorio_id: int):
    # ... (código existente)
    pass

@app.post("/upload", response_model=UploadResponse, tags=["Relatórios"], summary="Upload de novo relatório")
async def upload_relatorio(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    # ... (código existente)
    pass

@app.get("/stats/kpis", response_model=NewKpiStatsResponse, tags=["Estatísticas"], summary="Busca os KPIs principais")
def get_main_kpis():
    # ... (código existente)
    pass

@app.get("/stats/clients-by-city", tags=["Estatísticas"])
def get_clients_by_city():
    # ... (código existente)
    pass

@app.get("/stats/offline-history", tags=["Estatísticas"])
def get_offline_history():
    # ... (código existente)
    pass

@app.delete("/clients/all", response_model=MessageResponse, tags=["Clientes"])
def delete_all_clients():
    # ... (código existente)
    pass

@app.delete("/clients", response_model=MessageResponse, tags=["Clientes"])
def delete_selected_clients(request: DeleteRequest):
    # ... (código existente)
    pass

