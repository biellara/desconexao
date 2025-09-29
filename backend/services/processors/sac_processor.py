import pandas as pd
import logging
from .helpers import normalize_and_map_columns

logger = logging.getLogger(__name__)

# Mapeamento de colunas atualizado para o relatório de Performance do SAC
SAC_COLUMN_ALIASES = {
    "agente": ["nome", "atendente"],
    "data_atendimento": ["data"], # Mantido para retrocompatibilidade com outros relatórios
    "nota_monitoria": ["nota", "nota monitoria"],
    "tempo_medio_atendimento_minutos": ["tempo medio", "tempo_medio"]
}

def time_str_to_minutes(time_str):
    """Converte uma string de tempo (ex: HH:MM:SS ou MM:SS) para um total de minutos."""
    if pd.isna(time_str) or not isinstance(time_str, str):
        return 0
    try:
        parts = list(map(int, time_str.split(':')))
        if len(parts) == 3:  # Formato HH:MM:SS
            h, m, s = parts
            return h * 60 + m
        elif len(parts) == 2:  # Formato MM:SS
            m, s = parts
            return m
        return 0
    except (ValueError, IndexError):
        return 0 # Retorna 0 se o formato for inesperado

def processar_relatorio_sac(df: pd.DataFrame, relatorio_id: int, supabase_client) -> None:
    """
    Processa um DataFrame de relatório de performance do SAC e insere no banco de dados.
    """
    logger.info(f"Processando relatório de PERFORMANCE SAC para o ID: {relatorio_id}")

    df_renamed = normalize_and_map_columns(df, SAC_COLUMN_ALIASES)

    # Validação de colunas essenciais atualizada (data agora é opcional)
    required_cols = ["agente", "nota_monitoria"]
    if not all(col in df_renamed.columns for col in required_cols):
        raise ValueError("[Processador SAC] O arquivo do SAC deve conter colunas para 'Agente' (ou 'Nome') e 'Nota Monitoria'.")

    # Garante que a coluna de data exista, mesmo que vazia
    if 'data_atendimento' not in df_renamed.columns:
        df_renamed['data_atendimento'] = pd.NaT # Not a Time

    # Converte a coluna de data, tratando erros, mas não remove linhas se a data for nula
    df_renamed['data_atendimento'] = pd.to_datetime(df_renamed['data_atendimento'], errors='coerce')

    # Converte colunas numéricas, preenchendo NaNs com 0
    if 'nota_monitoria' in df_renamed.columns:
        df_renamed['nota_monitoria'] = pd.to_numeric(df_renamed['nota_monitoria'], errors='coerce').fillna(0)
    else:
        df_renamed['nota_monitoria'] = 0

    # Converte a coluna de tempo de texto para minutos inteiros
    if 'tempo_medio_atendimento_minutos' in df_renamed.columns:
        df_renamed['tempo_medio_atendimento_minutos'] = df_renamed['tempo_medio_atendimento_minutos'].apply(time_str_to_minutes)
    else:
        df_renamed['tempo_medio_atendimento_minutos'] = 0

    # Seleciona, adiciona o ID do relatório e prepara o payload
    colunas_db = [
        "agente", "data_atendimento", "nota_monitoria", 
        "tempo_medio_atendimento_minutos",
    ]
    df_final = df_renamed.copy()
    
    # Garante que todas as colunas do DB existam no DataFrame final
    for col in colunas_db:
        if col not in df_final.columns:
            df_final[col] = None if col != "tempo_medio_atendimento_minutos" else 0

    df_final = df_final[colunas_db] # Garante a ordem e colunas corretas
    df_final['relatorio_id'] = relatorio_id
    
    df_final = df_final.where(pd.notna(df_final), None)
    dados_para_inserir = df_final.to_dict("records")

    # Converte o objeto de data para uma string no formato ISO, se a data existir
    for record in dados_para_inserir:
        if pd.notna(record.get("data_atendimento")):
            record["data_atendimento"] = record["data_atendimento"].isoformat()
        else:
            record["data_atendimento"] = None # Garante que seja None se a data for inválida/ausente

    if dados_para_inserir:
        logger.info(f"Inserindo {len(dados_para_inserir)} registros de performance do SAC no DB.")
        insert_res = supabase_client.table('sac_performance').insert(dados_para_inserir).execute()
        if hasattr(insert_res, 'error') and insert_res.error:
            raise Exception(f"Falha ao salvar dados do SAC no banco: {insert_res.error}")
    else:
        logger.warning(f"Nenhum registro válido encontrado para o relatório de SAC ID: {relatorio_id}")

