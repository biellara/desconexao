from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import logging
import os
from typing import List, Optional, Dict
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
# Importa os processadores específicos
from backend.services.processors import desconexao_processor, monitoria_processor, sac_processor

# --- Carregar o Token do ERP do ambiente ---
ERP_TOKEN = os.getenv("ERP_API_TOKEN")
if not ERP_TOKEN:
    logger.warning("A variável de ambiente ERP_API_TOKEN não está definida. A integração com o ERP pode falhar.")


# --- Modelos Pydantic (Tipagem de Dados) ---
class ErpRequest(BaseModel):
    client_name: str = Field(..., example="GABRIEL DIAS DE LARA")

class ErpClientResponse(BaseModel):
    client_id: int = Field(..., example=337)
    client_name: str

class DeleteRequest(BaseModel):
    ids: List[int] = Field(..., example=[1, 2, 3])

class MessageResponse(BaseModel):
    message: str = Field(..., example="Operação bem-sucedida.")

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
    version="1.3.0"
)

origins = [
    "https://desconexao.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
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
            
            return ErpClientResponse(client_id=client_id, client_name=request.client_name)

    except httpx.HTTPStatusError as e:
        error_body = e.response.text or "Sem detalhes"
        logger.error(f"Erro de comunicação com a API do ERP ({e.response.status_code}): {error_body}")
        raise HTTPException(status_code=e.response.status_code, detail=f"Erro ao comunicar com o ERP.")
    except Exception as e:
        logger.error(f"Erro inesperado na integração com ERP: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Ocorreu um erro inesperado na integração.")


# --- Demais Rotas ---

@app.get("/", tags=["Status"])
def read_root():
    return {"status": "API online"}

# Mapeamento dos tipos de relatório para suas funções de processamento
PROCESSORS: Dict[str, callable] = {
    "desconexao": desconexao_processor.processar_relatorio_desconexao,
    "monitoria": monitoria_processor.processar_relatorio_monitoria,
    "sac": sac_processor.processar_relatorio_sac,
}

def processar_arquivo_em_background(relatorio_id: int, contents: bytes, filename: str, report_type: str):
    logger.info(f"Iniciando processamento em background para o relatório ID: {relatorio_id}, Tipo: {report_type}")
    try:
        supabase.table('relatorios').update({"status": "PROCESSING"}).eq('id', relatorio_id).execute()
        
        df = None
        file_stream = io.BytesIO(contents)

        if filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file_stream)
        elif filename.endswith('.csv'):
            try:
                df = pd.read_csv(file_stream, sep=',', engine='python', encoding='utf-8-sig')
                if df.shape[1] == 1:
                    logger.warning("CSV lido com uma única coluna usando vírgula. Tentando com ponto e vírgula.")
                    file_stream.seek(0)
                    df = pd.read_csv(file_stream, sep=';', engine='python', encoding='utf-8-sig')
            except Exception as e:
                logger.warning(f"Falha ao ler CSV com UTF-8. Tentando com latin-1. Erro: {e}")
                file_stream.seek(0)
                df = pd.read_csv(file_stream, sep=None, engine='python', encoding='latin-1')
        
        if df is None:
             raise ValueError("Não foi possível ler o arquivo. Formato pode ser inválido ou o arquivo está corrompido.")

        # --- Lógica de Roteamento ---
        processor_func = PROCESSORS.get(report_type)
        if not processor_func:
            raise ValueError(f"Tipo de relatório desconhecido: '{report_type}'")

        # Chama a função de processamento correta, passando o cliente supabase
        processor_func(df=df, relatorio_id=relatorio_id, supabase_client=supabase)
        # ---------------------------
        
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
async def upload_relatorio(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...),
    report_type: str = Form("desconexao") # Recebe o tipo de relatório do formulário
):
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Formato de arquivo inválido. Use Excel ou CSV.")
    
    contents = await file.read()
    
    insert_res = supabase.table('relatorios').insert({
        "nome_arquivo": file.filename,
        "status": "PENDING",
        "tipo": report_type # Salva o tipo no banco de dados
    }).execute()

    if not insert_res.data:
        raise HTTPException(status_code=500, detail="Não foi possível criar o registro do relatório.")
    
    relatorio_id = insert_res.data[0]['id']
    background_tasks.add_task(processar_arquivo_em_background, relatorio_id, contents, file.filename, report_type)
    
    return {"message": "Arquivo recebido! O processamento foi iniciado.", "relatorio_id": relatorio_id}

# --- NOVOS ENDPOINTS PARA O MÓDULO SAC ---
@app.get("/stats/sac/kpis", tags=["Estatísticas SAC"], summary="Busca os KPIs do SAC")
def get_sac_kpis():
    try:
        response = supabase.rpc('get_sac_kpis').execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return {"media_nota_monitoria": 0, "tempo_medio_atendimento_minutos": 0}
    except Exception as e:
        logger.error(f"Erro em /stats/sac/kpis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erro ao buscar KPIs do SAC.")

@app.get("/stats/sac/performance-agente", tags=["Estatísticas SAC"], summary="Busca a performance por agente")
def get_performance_por_agente():
    try:
        response = supabase.rpc('get_performance_por_agente').execute()
        return response.data
    except Exception as e:
        logger.error(f"Erro em /stats/sac/performance-agente: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erro ao buscar performance por agente.")
# --- FIM DOS NOVOS ENDPOINTS ---

@app.get("/stats/kpis", response_model=NewKpiStatsResponse, tags=["Estatísticas"], summary="Busca os KPIs principais")
def get_main_kpis():
    try:
        response = supabase.rpc('get_new_dashboard_kpis').execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        
        logger.warning("A RPC 'get_new_dashboard_kpis' não retornou dados. Usando valores padrão.")
        return NewKpiStatsResponse(new_critical_cases_24h=0, most_critical_olt="N/A", oldest_case_days=0)
        
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

