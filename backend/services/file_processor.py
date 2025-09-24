import pandas as pd
from datetime import datetime, timezone
from typing import Dict, Any, List

def processar_relatorio(df: pd.DataFrame, relatorio_id: int) -> List[Dict[str, Any]]:
    """
    Processa um DataFrame de relatório para encontrar clientes offline > 48h.
    """

    # 1. Padroniza nomes de colunas
    colunas_map = {
        'Nome Cliente': 'nome_cliente', 'Cliente': 'nome_cliente',
        'Serial ONU': 'serial_onu', 'SN ONU': 'serial_onu',
        'OLT': 'olt_regiao',
        'Status': 'status_conexao',
        'Ultima Comunicacao': 'data_desconexao', 'Última Alteração de Status': 'data_desconexao'
    }
    df = df.rename(columns=colunas_map)

    colunas_necessarias = ['status_conexao', 'data_desconexao']
    if not all(coluna in df.columns for coluna in colunas_necessarias):
        raise ValueError("O arquivo não contém as colunas necessárias: 'Status' e ('Ultima Comunicacao' ou 'Última Alteração de Status')")

    # 2. Filtra apenas clientes com status "LOSS"
    df_loss = df[df['status_conexao'].astype(str).str.strip().str.upper() == 'LOSS'].copy()
    if df_loss.empty:
        return []

    # 3. Converte a coluna de data para datetime
    df_loss['data_desconexao'] = pd.to_datetime(df_loss['data_desconexao'], errors='coerce')
    df_loss = df_loss.dropna(subset=['data_desconexao'])

    # 4. Calcula o tempo offline em horas
    agora_utc = datetime.now(timezone.utc)
    # garante timezone
    df_loss['data_desconexao'] = df_loss['data_desconexao'].dt.tz_localize('UTC', ambiguous='infer')

    # diferença em horas
    df_loss['horas_offline'] = (
        (agora_utc - df_loss['data_desconexao'])
        .dt.total_seconds() / 3600
    )

    # 5. Filtra clientes offline há mais de 48h
    df_off_48h = df_loss[df_loss['horas_offline'] > 48].copy()
    if df_off_48h.empty:
        return []

    # 6. Prepara para inserção
    df_off_48h['relatorio_id'] = relatorio_id
    df_off_48h['horas_offline'] = df_off_48h['horas_offline'].astype(int)

    colunas_para_db = [
        'relatorio_id', 'nome_cliente', 'serial_onu',
        'olt_regiao', 'data_desconexao', 'horas_offline'
    ]
    for col in colunas_para_db:
        if col not in df_off_48h.columns:
            df_off_48h[col] = None

    # typing ajuda: DataFrame -> List[Dict[str, Any]]
    dados_para_inserir: List[Dict[str, Any]] = df_off_48h[colunas_para_db].to_dict(orient='records')  # type: ignore

    for record in dados_para_inserir:
        if pd.notna(record['data_desconexao']):
            record['data_desconexao'] = record['data_desconexao'].isoformat()

    return dados_para_inserir
