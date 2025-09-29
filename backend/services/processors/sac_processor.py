import pandas as pd
import logging
from .helpers import normalize_and_map_columns

logger = logging.getLogger(__name__)

# Mapeamento de colunas atualizado para incluir os novos campos
SAC_COLUMN_ALIASES = {
    "agente": ["nome", "atendente"],
    "atendimentos": ["atendimentos"],
    "cliente_atendido": ["cliente atendido"],
    "encerrado": ["encerrado"],
    "data_atendimento": ["data"],
    "nota_monitoria": ["nota", "nota monitoria"],
    "tempo_medio_atendimento_minutos": ["tempo medio", "tempo_medio"]
}

def time_str_to_minutes(time_str):
    """Converte uma string de tempo (ex: HH:MM:SS ou MM:SS) para um total de minutos."""
    if pd.isna(time_str) or not isinstance(time_str, str):
        return 0
    try:
        parts = list(map(int, time_str.split(':')))
        if len(parts) == 3:
            h, m, s = parts
            return h * 60 + m
        elif len(parts) == 2:
            m, s = parts
            return m
        return 0
    except (ValueError, IndexError):
        return 0

def processar_relatorio_sac(df: pd.DataFrame, relatorio_id: int, supabase_client) -> None:
    logger.info(f"Processando relatório de PERFORMANCE SAC para o ID: {relatorio_id}")

    df_renamed = normalize_and_map_columns(df, SAC_COLUMN_ALIASES)

    required_cols = ["agente", "nota_monitoria"]
    if not all(col in df_renamed.columns for col in required_cols):
        raise ValueError("[Processador SAC] O arquivo deve conter colunas para 'Agente' (ou 'Nome') e 'Nota Monitoria'.")

    # Garante a existência das colunas opcionais
    optional_cols = ['data_atendimento', 'tempo_medio_atendimento_minutos', 'atendimentos', 'cliente_atendido', 'encerrado']
    for col in optional_cols:
        if col not in df_renamed.columns:
            df_renamed[col] = None
    
    df_renamed['data_atendimento'] = pd.to_datetime(df_renamed['data_atendimento'], errors='coerce')

    # Converte colunas numéricas, preenchendo NaNs com 0
    numeric_cols = ['nota_monitoria', 'atendimentos', 'cliente_atendido', 'encerrado']
    for col in numeric_cols:
        df_renamed[col] = pd.to_numeric(df_renamed[col], errors='coerce').fillna(0)

    df_renamed['tempo_medio_atendimento_minutos'] = df_renamed['tempo_medio_atendimento_minutos'].apply(time_str_to_minutes)

    colunas_db = [
        "agente", "data_atendimento", "nota_monitoria", 
        "tempo_medio_atendimento_minutos", "atendimentos", 
        "cliente_atendido", "encerrado"
    ]
    df_final = df_renamed.copy()
    
    # Adiciona colunas que possam faltar
    for col in colunas_db:
        if col not in df_final.columns:
            df_final[col] = 0 if col != 'data_atendimento' else None

    df_final = df_final[colunas_db]
    df_final['relatorio_id'] = relatorio_id
    
    df_final = df_final.where(pd.notna(df_final), None)
    dados_para_inserir = df_final.to_dict("records")

    for record in dados_para_inserir:
        if pd.notna(record.get("data_atendimento")):
            record["data_atendimento"] = record["data_atendimento"].isoformat()
        else:
            record["data_atendimento"] = None

    if dados_para_inserir:
        logger.info(f"Inserindo {len(dados_para_inserir)} registros de performance do SAC no DB.")
        insert_res = supabase_client.table('sac_performance').insert(dados_para_inserir).execute()
        if hasattr(insert_res, 'error') and insert_res.error:
            raise Exception(f"Falha ao salvar dados do SAC no banco: {insert_res.error}")
    else:
        logger.warning(f"Nenhum registro válido encontrado para o relatório de SAC ID: {relatorio_id}")

