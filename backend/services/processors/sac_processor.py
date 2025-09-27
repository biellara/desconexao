import pandas as pd
import logging
from .helpers import normalize_text, normalize_and_map_columns

logger = logging.getLogger(__name__)

# Mapeamento de colunas para o relatório de Performance do SAC
# Adapte os aliases conforme os nomes das colunas no seu arquivo CSV real.
SAC_COLUMN_ALIASES = {
    "agente": ["nome_do_agente", "agente", "atendente"],
    "data_feedback": ["data", "data_da_monitoria", "feedback_date"],
    "nota_monitoria": ["nota", "nota_final", "monitoria"],
    "tempo_total_atendimento": ["tempo_atendimento_segundos", "tempo_total", "tma_s"]
}

def processar_relatorio_sac(df: pd.DataFrame, relatorio_id: int, supabase_client) -> None:
    """
    Processa o relatório de Performance do SAC e insere os dados no banco.
    """
    logger.info(f"Processando relatório de PERFORMANCE SAC para o ID: {relatorio_id}")

    # Normaliza e mapeia as colunas do DataFrame
    df_renamed = normalize_and_map_columns(df, SAC_COLUMN_ALIASES)

    # Validação de colunas essenciais
    required_cols = ["agente", "data_feedback", "nota_monitoria"]
    if not all(col in df_renamed.columns for col in required_cols):
        raise ValueError("O arquivo do SAC deve conter colunas para agente, data e nota.")

    # --- Tratamento de Dados ---
    df_renamed['relatorio_id'] = relatorio_id
    
    # Converte data, tratando múltiplos formatos
    df_renamed['data_feedback'] = pd.to_datetime(df_renamed['data_feedback'], dayfirst=True, errors='coerce')
    
    # Converte colunas numéricas
    numeric_cols = ['nota_monitoria', 'tempo_total_atendimento']
    for col in numeric_cols:
        if col in df_renamed.columns:
            df_renamed[col] = pd.to_numeric(df_renamed[col], errors='coerce')

    # Remove linhas onde dados essenciais são nulos
    df_renamed.dropna(subset=['agente', 'data_feedback', 'nota_monitoria'], inplace=True)
    
    # Seleciona apenas as colunas que existem na tabela do DB
    colunas_db = [
        'relatorio_id', 'agente', 'data_feedback', 
        'nota_monitoria', 'tempo_total_atendimento'
    ]
    
    # Garante que todas as colunas do DB existam no DataFrame, preenchendo com None se necessário
    for col in colunas_db:
        if col not in df_renamed.columns:
            df_renamed[col] = None
            
    df_final = df_renamed[colunas_db]

    # Converte para dicionário e insere no Supabase
    dados_para_inserir = df_final.to_dict("records")

    if dados_para_inserir:
        logger.info(f"Inserindo {len(dados_para_inserir)} registros de performance do SAC no DB.")
        insert_res = supabase_client.table('sac_performance').insert(dados_para_inserir).execute()
        if hasattr(insert_res, 'error') and insert_res.error:
            raise Exception(f"Falha ao salvar dados de performance do SAC: {insert_res.error}")
    else:
        logger.info("Nenhum dado válido de performance do SAC encontrado no relatório.")

