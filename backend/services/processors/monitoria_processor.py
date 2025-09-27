import pandas as pd
import logging

logger = logging.getLogger(__name__)

def processar_relatorio_monitoria(df: pd.DataFrame, relatorio_id: int, supabase_client) -> None:
    logger.info(f"[Monitoria Processor] Iniciando | Relatório ID={relatorio_id}")
    logger.info(f"[Monitoria Processor] Colunas recebidas: {df.columns.tolist()}")

    # Ainda não implementado
    logger.warning("[Monitoria Processor] Processamento não implementado - apenas logando colunas.")
    
    pass
