import pandas as pd
import logging
from .helpers import normalize_and_map_columns

logger = logging.getLogger(__name__)

# Mapeamento de colunas para o relatório de Performance do SAC
SAC_COLUMN_ALIASES = {
    "agente": ["nome", "atendente"],
    "data_atendimento": ["data"],
    "nota_monitoria": ["nota", "nota monitoria"],
    "tempo_medio_atendimento_minutos": ["tempo medio", "tempo_medio"]
}

def processar_relatorio_sac(df: pd.DataFrame, relatorio_id: int, supabase_client) -> None:
    """
    Processa um DataFrame de relatório de performance do SAC e insere no banco de dados.
    """
    logger.info(f"Processando relatório de PERFORMANCE SAC para o ID: {relatorio_id}")

    df_renamed = normalize_and_map_columns(df, SAC_COLUMN_ALIASES)

    # Validação de colunas essenciais com mensagem de erro específica
    required_cols = ["agente", "data_atendimento", "nota_monitoria"]
    if not all(col in df_renamed.columns for col in required_cols):
        raise ValueError("[Processador SAC] O arquivo do SAC deve conter colunas para agente, data e nota.")

    # Converte a coluna de data, tratando erros
    df_renamed['data_atendimento'] = pd.to_datetime(df_renamed['data_atendimento'], errors='coerce')
    df_renamed.dropna(subset=['data_atendimento'], inplace=True)

    # Converte colunas numéricas, preenchendo NaNs com 0
    numeric_cols = ['nota_monitoria', 'tempo_medio_atendimento_minutos']
    for col in numeric_cols:
        if col in df_renamed.columns:
            df_renamed[col] = pd.to_numeric(df_renamed[col], errors='coerce').fillna(0)
        else:
            df_renamed[col] = 0 # Garante que a coluna exista

    # Seleciona, adiciona o ID do relatório e prepara o payload
    colunas_db = [
        "agente", "data_atendimento", "nota_monitoria", 
        "tempo_medio_atendimento_minutos",
    ]
    df_final = df_renamed[colunas_db].copy()
    df_final['relatorio_id'] = relatorio_id
    
    # Substitui valores nulos restantes por None
    df_final = df_final.where(pd.notna(df_final), None)
    dados_para_inserir = df_final.to_dict("records")

    # --- CORREÇÃO APLICADA AQUI ---
    # Converte o objeto de data para uma string no formato ISO antes de enviar
    for record in dados_para_inserir:
        if record.get("data_atendimento"):
            record["data_atendimento"] = record["data_atendimento"].isoformat()

    if dados_para_inserir:
        logger.info(f"Inserindo {len(dados_para_inserir)} registros de performance do SAC no DB.")
        insert_res = supabase_client.table('sac_performance').insert(dados_para_inserir).execute()
        if hasattr(insert_res, 'error') and insert_res.error:
            raise Exception(f"Falha ao salvar dados do SAC no banco: {insert_res.error}")
    else:
        logger.warning(f"Nenhum registro válido encontrado para o relatório de SAC ID: {relatorio_id}")

