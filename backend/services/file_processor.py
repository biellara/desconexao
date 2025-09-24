import pandas as pd
import numpy as np # Importa a biblioteca numpy
from datetime import datetime, timezone
from typing import Dict, Any

def processar_relatorio(df: pd.DataFrame, relatorio_id: int) -> list[Dict[str, Any]]:
    """
    Processa um DataFrame de relatório para encontrar clientes offline > 48h.
    
    Args:
        df: DataFrame do Pandas com os dados do relatório.
        relatorio_id: ID do relatório no banco de dados para associação.

    Returns:
        Uma lista de dicionários, cada um representando um cliente a ser inserido no banco.
    """
    
    colunas_map = {
        'Nome Cliente': 'nome_cliente', 'Cliente': 'nome_cliente',
        'Serial ONU': 'serial_onu', 'SN ONU': 'serial_onu',
        'OLT': 'olt_regiao',
        'Status': 'status_conexao',
        'Ultima Comunicacao': 'data_desconexao', 'Última Alteração de Status': 'data_desconexao'
    }
    df.rename(columns=colunas_map, inplace=True)
    
    colunas_necessarias = ['status_conexao', 'data_desconexao']
    if not all(coluna in df.columns for coluna in colunas_necessarias):
        raise ValueError("O arquivo não contém as colunas necessárias: 'Status' e ('Ultima Comunicacao' ou 'Última Alteração de Status')")

    df_loss = df[df['status_conexao'].str.strip().str.upper() == 'LOSS'].copy()
    
    if df_loss.empty:
        return []

    df_loss['data_desconexao'] = pd.to_datetime(df_loss['data_desconexao'], errors='coerce')
    df_loss.dropna(subset=['data_desconexao'], inplace=True)

    agora_utc = datetime.now(timezone.utc)
    df_loss['data_desconexao'] = df_loss['data_desconexao'].dt.tz_localize('UTC', ambiguous='infer')
    df_loss['horas_offline'] = (agora_utc - df_loss['data_desconexao']).dt.total_seconds() / 3600
    
    df_off_48h = df_loss[df_loss['horas_offline'] > 48].copy()

    if df_off_48h.empty:
        return []

    df_off_48h['relatorio_id'] = relatorio_id
    df_off_48h['horas_offline'] = df_off_48h['horas_offline'].astype(int)
    
    colunas_para_db = [
        'relatorio_id', 'nome_cliente', 'serial_onu', 
        'olt_regiao', 'data_desconexao', 'horas_offline'
    ]
    
    for col in colunas_para_db:
        if col not in df_off_48h.columns:
            df_off_48h[col] = None
    
    # --- ETAPA DE LIMPEZA ADICIONADA ---
    # Substitui valores infinitos (inf, -inf) e NaN por None (que vira null em JSON)
    # Isso garante que o DataFrame seja compatível com JSON.
    df_final = df_off_48h[colunas_para_db].copy()
    df_final.replace([np.inf, -np.inf], np.nan, inplace=True)
    dados_para_inserir = df_final.where(pd.notna(df_final), None).to_dict('records')
    
    for record in dados_para_inserir:
        if record.get('data_desconexao'):
            record['data_desconexao'] = record['data_desconexao'].isoformat()

    return dados_para_inserir