from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io

# Importa os nossos módulos de serviço
from services.supabase_client import supabase
from services.file_processor import processar_relatorio

app = FastAPI(
    title="Dashboard ONUs API",
    description="API para processar relatórios de ONUs e identificar clientes offline.",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "API online"}

@app.post("/upload")
async def upload_relatorio(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Formato de arquivo inválido. Use Excel ou CSV.")

    try:
        contents = await file.read()
        
        insert_relatorio_res = supabase.table('relatorios').insert({
            "nome_arquivo": file.filename,
            "tamanho_arquivo_kb": int(len(contents) / 1024)
        }).execute()

        if not insert_relatorio_res.data:
            raise HTTPException(status_code=500, detail="Não foi possível salvar os metadados do relatório.")
        
        relatorio_id = insert_relatorio_res.data[0]['id']

        if file.filename.endswith('.csv'):
            # Para CSV, podemos precisar identificar o separador (ponto e vírgula é comum no Brasil)
            try:
                df = pd.read_csv(io.BytesIO(contents), sep=None, engine='python')
            except Exception:
                 df = pd.read_csv(io.BytesIO(contents), sep=';', encoding='latin-1')
        else:
            df = pd.read_excel(io.BytesIO(contents))

        # --- USA O NOSSO SERVIÇO PARA PROCESSAR O ARQUIVO ---
        clientes_para_inserir = processar_relatorio(df, relatorio_id)
        
        if clientes_para_inserir:
            insert_clientes_res = supabase.table('clientes_off').insert(clientes_para_inserir).execute()
            if not insert_clientes_res.data:
                raise HTTPException(status_code=500, detail="Erro ao salvar os clientes offline no banco de dados.")

        return {
            "message": "Arquivo processado e dados salvos com sucesso!",
            "relatorio_id": relatorio_id,
            "total_records_no_arquivo": len(df),
            "clientes_offline_inseridos": len(clientes_para_inserir)
        }
            
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar o arquivo: {str(e)}")

