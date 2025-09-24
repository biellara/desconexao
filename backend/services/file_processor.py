import pandas as pd
from datetime import datetime, timezone

def processar_relatorio(df: pd.DataFrame, relatorio_id: int) -> list:
    """
    Processa um DataFrame de relatório para encontrar clientes offline > 48h.
    
    Args:
        df: DataFrame do Pandas com os dados do relatório.
        relatorio_id: ID do relatório no banco de dados para associação.

    Returns:
        Uma lista de dicionários, cada um representando um cliente a ser inserido no banco.
    """
    
    # 1. Mapeamento de possíveis nomes de colunas para um padrão
    # Isso torna o código mais robusto a variações nos nomes das colunas do relatório.
    colunas_map = {
        'Nome Cliente': 'nome_cliente',
        'Serial ONU': 'serial_onu',
        'OLT': 'olt_regiao',
        'Status': 'status_conexao',
        'Ultima Comunicacao': 'data_desconexao'
    }
    # Renomeia as colunas do DataFrame de acordo com o mapeamento
    df.rename(columns=colunas_map, inplace=True)
    
    # Validação: verifica se as colunas essenciais existem após o renomeio
    colunas_necessarias = ['status_conexao', 'data_desconexao']
    if not all(coluna in df.columns for coluna in colunas_necessarias):
        raise ValueError("O arquivo não contém as colunas necessárias: 'Status' e 'Ultima Comunicacao'")

    # 2. Filtra apenas clientes com status "LOSS" (ignorando maiúsculas/minúsculas)
    clientes_loss = df[df['status_conexao'].str.strip().str.upper() == 'LOSS'].copy()
    
    if clientes_loss.empty:
        return [] # Retorna lista vazia se nenhum cliente com status LOSS for encontrado

    # 3. Converte a coluna de data para o formato datetime
    # 'errors="coerce"' transforma datas inválidas em NaT (Not a Time), que serão removidas
    clientes_loss['data_desconexao'] = pd.to_datetime(clientes_loss['data_desconexao'], errors='coerce')
    clientes_loss.dropna(subset=['data_desconexao'], inplace=True) # Remove linhas com datas inválidas
    
    # 4. Calcula o tempo offline em horas
    # Pega a data e hora atual com fuso horário (UTC) para um cálculo preciso
    agora_utc = datetime.now(timezone.utc)
    
    # Garante que a coluna de desconexão também tenha fuso horário UTC
    clientes_loss['data_desconexao'] = clientes_loss['data_desconexao'].dt.tz_localize('UTC', ambiguous='infer')

    # Calcula a diferença e converte para horas
    clientes_loss['horas_offline'] = (agora_utc - clientes_loss['data_desconexao']).dt.total_seconds() / 3600
    
    # 5. Filtra clientes offline há mais de 48 horas
    clientes_off_48h = clientes_loss[clientes_loss['horas_offline'] > 48].copy()

    if clientes_off_48h.empty:
        return [] # Nenhum cliente atingiu o limite de 48h

    # 6. Prepara os dados para inserção no Supabase
    clientes_off_48h['relatorio_id'] = relatorio_id
    
    # Converte horas para inteiro
    clientes_off_48h['horas_offline'] = clientes_off_48h['horas_offline'].astype(int)
    
    # Seleciona apenas as colunas que correspondem à tabela 'clientes_off'
    colunas_para_db = [
        'relatorio_id', 'nome_cliente', 'serial_onu', 
        'olt_regiao', 'data_desconexao', 'horas_offline'
    ]
    
    # Garante que todas as colunas necessárias existam, preenchendo com None se faltar
    for col in colunas_para_db:
        if col not in clientes_off_48h.columns:
            clientes_off_48h[col] = None
            
    # Converte o DataFrame para uma lista de dicionários
    dados_para_inserir = clientes_off_48h[colunas_para_db].to_dict('records')
    
    # Converte o datetime para o formato string ISO 8601, que o Supabase entende
    for record in dados_para_inserir:
        record['data_desconexao'] = record['data_desconexao'].isoformat()

    return dados_para_inserir
