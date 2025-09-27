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
    logger.info(f"[SAC Processor] Iniciando | Relatório ID={relatorio_id}")
    logger.info(f"[SAC Processor] Colunas recebidas: {df.columns.tolist()}")

    # Normaliza e mapeia as colunas do DataFrame
    df_renamed = normalize_and_map_columns(df, SAC_COLUMN_ALIASES)
    logger.info(f"[SAC Processor] Colunas após normalização/mapeamento: {df_renamed.columns.tolist()}")

    # Validação de colunas essenciais
    required_cols = ["agente", "data_feedback", "nota_monitoria"]
    if not all(col in df_renamed.columns for col in required_cols):
        raise ValueError(f"[SAC Processor] Arquivo inválido: faltam colunas obrigatórias. Esperado {required_cols}, recebido {df_renamed.columns.tolist()}")

    # --- Tratamento de Dados ---
    df_renamed['relatorio_id'] = relatorio_id
    
    # Converte data
    df_renamed['data_feedback'] = pd.to_datetime(df_renamed['data_feedback'], dayfirst=True, errors='coerce')
    
    # Converte numéricos
    numeric_cols = ['nota_monitoria', 'tempo_total_atendimento']
    for col in numeric_cols:
        if col in df_renamed.columns:
            df_renamed[col] = pd.to_numeric(df_renamed[col], errors='coerce')
            logger.info(f"[SAC Processor] Coluna {col} convertida para numérico")

    # Remove linhas inválidas
    antes = len(df_renamed)
    df_renamed.dropna(subset=['agente', 'data_feedback', 'nota_monitoria'], inplace=True)
    depois = len(df_renamed)
    logger.info(f"[SAC Processor] Linhas removidas por dados nulos: {antes - depois}")

    # Seleciona colunas do DB
    colunas_db = ['relatorio_id', 'agente', 'data_feedback', 'nota_monitoria', 'tempo_total_atendimento']
    for col in colunas_db:
        if col not in df_renamed.columns:
            df_renamed[col] = None
            
    df_final = df_renamed[colunas_db]
    logger.info(f"[SAC Processor] DataFrame final pronto: {df_final.shape[0]} linhas, {df_final.shape[1]} colunas")

    dados_para_inserir = df_final.to_dict("records")

    if dados_para_inserir:
        logger.info(f"[SAC Processor] Inserindo {len(dados_para_inserir)} registros no Supabase")
        insert_res = supabase_client.table('sac_performance').insert(dados_para_inserir).execute()
        if hasattr(insert_res, 'error') and insert_res.error:
            raise Exception(f"[SAC Processor] Falha ao salvar dados: {insert_res.error}")
    else:
        logger.warning("[SAC Processor] Nenhum dado válido encontrado para inserir")
