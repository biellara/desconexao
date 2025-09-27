import pandas as pd
import numpy as np
from datetime import datetime, timezone
import logging
from .helpers import normalize_and_map_columns

logger = logging.getLogger(__name__)

# Mapeamento de colunas para o relatório de Desconexão
DISCONNECTION_COLUMN_ALIASES = {
    "nome_cliente": ["cliente"],
    "serial_onu": ["sn_onu"],
    "olt_regiao": ["olt"],
    "status_conexao": ["status"],
    "data_desconexao": ["ultima_alteracao_de_status", "ultima_atualizacao_de_sinal", "ultima_comunicacao"],
    "cto": ["cto"],
    "slot_pon_onu": ["slotpononu_id"],
    "modelo_onu": ["modelo"],
    "rx_onu": ["rx_onu"],
    "rx_olt": ["rx_olt"],
    "distancia_m": ["distancia_entre_olt_e_onu_m"]
}

# --- MAPEAMENTO DE OLT PARA CIDADE ---
OLT_CIDADE_MAP = {
    # Londrina
    "OLT-LDB-HUAWEI-DC": "Londrina", "OLT-LDB-HUAWEI-OSCAR": "Londrina", "OLT-LDB-HUAWEI-ZONA-NORTE": "Londrina",
    "OLT-LDB-HUAWEI-10-DEZEMBRO": "Londrina", "OLT-LDB-HUAWEI-ANA-ROSA": "Londrina", "OLT-LDB-HUAWEI-CATUAI": "Londrina",
    "OLT-LDB-HUAWEI-COLUMBIA": "Londrina", "OLT-LDB-HUAWEI-HU": "Londrina", "OLT-LDB-HUAWEI-PARK-UNIVERSITARIO": "Londrina",
    "OLT-LDB-HUAWEI-SPAZIO-LYON": "Londrina", "OLT-LDB-HUAWEI-UTF-PR": "Londrina", "OLT-LDB-HUAWEI-UTF-PR-2": "Londrina",
    "OLT-LDB-FH-OSCAR": "Londrina", "OLT-LDB-HUAWEI-DC-02": "Londrina",
    # Jataizinho
    "OLT-JZN -HUAWEI-JATAIZINHO": "Jataizinho",
    # Paiçandu
    "OLT-PNU-ZTE-PAICANDU-01": "Paiçandu",
    # Maringá
    "OLT-MGF-ZTE-SERENITY-02": "Maringá", "OLT-MGF-ZTE-GETULIO-03": "Maringá", "OLT-MGF-PARKS-MUSCAT-54": "Maringá",
    "OLT-MGF-PARKS-EDF-HAVANA-53": "Maringá", "OLT-MGF-PARKS-EDF-SOLARIS-52": "Maringá", "OLT-MGF-PARKS-EDF-HAVANA-51": "Maringá",
    "OLT-MGF-PARKS-SUMARE-40": "Maringá", "OLT-MGF-PARKS-EDF-PORTAL-JAPAO-16": "Maringá", "OLT-MGF-PARKS-EDF-HAVANA-12": "Maringá",
    "OLT-MGF-PARKS-EDF-HAVANA-11": "Maringá", "OLT-MGF-PARKS-MUSCAT-10": "Maringá", "OLT-MGF-PARKS-INFINITY-09": "Maringá",
    "OLT-MGF-PARKS-MISATO-08": "Maringá", "OLT-MGF-PARKS-MUSCAT-07": "Maringá", "OLT-MGF-PARKS-DELTA-06": "Maringá",
    "OLT-MGF-PARKS-DELTA-05": "Maringá", "OLT-MGF-PARKS-ORIENTAL-04": "Maringá", "OLT-MGF-PARKS-MARINGA-02": "Maringá",
    "OLT-MGF-PARKS-MARINGA-01": "Maringá", "OLT-MGF-FH-GUAIAPO-01": "Maringá", "OLT-MGF-FH-GUAIAPO-04": "Maringá",
    "OLT-MGF-FH-ORIENTAL-06": "Maringá", "OLT-MGF-PARKS-ORIENTAL-04---MIGRAÇÃO": "Maringá", "OLT-MGF-PARKS-TESTE": "Maringá",
    # Marialva
    "OLT-MRV-PARKS-MARIALVA-50": "Marialva", "OLT-MRV-PARKS-MARIALVA-49": "Marialva", "OLT-MRV-PARKS-MARIALVA-48": "Marialva",
    "OLT-MRV-PARKS-MARIALVA-47": "Marialva", "OLT-MRV-PARKS-MARIALVA-46": "Marialva", "OLT-MRV-PARKS-MARIALVA-45": "Marialva",
    "OLT-MRV-PARKS-MARIALVA-44": "Marialva", "OLT-MRV-PARKS-MARIALVA-43": "Marialva", "OLT-MRV-PARKS-MARIALVA-42": "Marialva",
    "OLT-MRV-PARKS-MARIALVA-41": "Marialva", "OLT-MRV-FH-MARIALVA-07": "Marialva",
    # Alvorada do Sul
    "OLT-AVL-PARKS-ALVORADA-DO-SUL-38": "Alvorada do Sul", "OLT-AVL-PARKS-ALVORADA-DO-SUL-37": "Alvorada do Sul",
    "OLT-AVL-PARKS-ALVORADA-DO-SUL-36": "Alvorada do Sul", "OLT-AVL-PARKS-ALVORADA-DO-SUL-35": "Alvorada do Sul",
    "OLT-AVL-PARKS-ALVORADA-DO-SUL-34": "Alvorada do Sul",
    # Porecatu
    "OLT-PRU-PARKS-PORECATU-CONDOMINIO-33": "Porecatu", "OLT-PRU-PARKS-PORECATU-CONDOMINIO-32": "Porecatu",
    "OLT-PRU-PARKS-PORECATU-31": "Porecatu", "OLT-PRU-PARKS-PORECATU-30": "Porecatu", "OLT-PRU-PARKS-PORECATU-29": "Porecatu",
    "OLT-PRU-PARKS-PORECATU-28": "Porecatu", "OLT-PRU-PARKS-PORECATU-27": "Porecatu",
    # Sabáudia
    "OLT-SDY-PARKS-SABAUDIA-26": "Sabáudia", "OLT-SDY-PARKS-SABAUDIA-25": "Sabáudia", "OLT-SDY-PARKS-SABAUDIA-24": "Sabáudia",
    "OLT-SDY-PARKS-SABAUDIA-23": "Sabáudia",
    # Florestópolis
    "OLT-FOS-PARKS-FLORESTOPOLIS-22": "Florestópolis", "OLT-FOS-PARKS-FLORESTOPOLIS-21": "Florestópolis",
    "OLT-FOS-PARKS-FLORESTOPOLIS-20": "Florestópolis", "OLT-FOS-PARKS-FLORESTOPOLIS-19": "Florestópolis",
    "OLT-FOS-PARKS-FLORESTOPOLIS-18": "Florestópolis", "OLT-FOS-PARKS-FLORESTOPOLIS-17": "Florestópolis",
    # Prado Ferreira
    "OLT-PFI-PARKS-PRADO-FERREIRA-15": "Prado Ferreira", "OLT-PFI-PARKS-PRADO-FERREIRA-14": "Prado Ferreira",
    "OLT-PFI-PARKS-PRADO-FERREIRA-13": "Prado Ferreira",
    # Sarandi
    "OLT-SWW-PARKS-SARANDI-03": "Sarandi", "OLT-SWW-FH-SARANDI-05": "Sarandi", "OLT-SWW-FH-SARANDI-08-POP2": "Sarandi",
    "OLT-SWW-FH-SARANDI-09-POP3": "Sarandi",
    # Apucarana
    "OLT-APU-FH-COLONIAL": "Apucarana", "OLT-APU-FH-CUBA": "Apucarana", "OLT-APU-FH-VENEZA": "Apucarana",
    "OLT-APU-FH-WIZARD": "Apucarana", "OLT-APU-FH-SEDE": "Apucarana",
    # Arapongas
    "OLT-APS-FH-AGUIA": "Arapongas", "OLT-APS-FH-UNOPAR": "Arapongas",
    # Califórnia
    "OLT-CFN-FH-CALIFORNIA": "Califórnia",
    # Cambira
    "OLT-CMB-FH-CAMBIRA": "Cambira",
    # Ibiporã
    "OLT-IOR-FH-IBIPORA": "Ibiporã",
    # Marilândia do Sul
    "OLT-MLA-FH-MARILANDIA-DO-SUL": "Marilândia do Sul",
    # Mauá da Serra
    "OLT-MQS-FH-MAUA-DA-SERRA": "Mauá da Serra",
    # Rolândia
    "OLT-RLA-FH-POP-01": "Rolândia", "OLT-RLA-FH-POP-02": "Rolândia", "OLT-RLA-FH-POP-03": "Rolândia",
    # Astorga
    "OLT-ATG-FH-ASTORGA-02": "Astorga",
    # Jaguapitã
    "OLT-JGP-FH-JAGUAPITA-03": "Jaguapitã",
    # Outros
    "OLT-PARKS-BANCADA": "Laboratório", "OLT-ZTE-BANCADA": "Laboratório",
}


def get_cidade_from_olt(olt_regiao: str) -> str:
    if not isinstance(olt_regiao, str):
        return 'Outra'
    # Procura por uma correspondência parcial para abranger mais casos
    for key, city in OLT_CIDADE_MAP.items():
        if key in olt_regiao:
            return city
    return 'Outra'

def processar_relatorio_desconexao(df: pd.DataFrame, relatorio_id: int, supabase_client) -> None:
    logger.info(f"Processando relatório de DESCONEXÃO para o ID: {relatorio_id}")
    
    df_renamed = normalize_and_map_columns(df, DISCONNECTION_COLUMN_ALIASES)
    
    # Validação com mensagem de erro específica
    if "status_conexao" not in df_renamed.columns or "data_desconexao" not in df_renamed.columns:
        raise ValueError("[Processador de Desconexão] O arquivo deve conter colunas para 'Status' e data (ex: 'Última Alteração').")

    df_renamed['motivo_desconexao'] = df_renamed['status_conexao']
    offline_statuses = ["LOSS", "SEM ENERGIA"]
    df_offline = df_renamed[df_renamed["status_conexao"].str.strip().str.upper().isin(offline_statuses)].copy()
    
    if df_offline.empty:
        logger.info("Nenhum cliente com status 'LOSS' ou 'Sem Energia' foi encontrado.")
        return

    df_offline["data_desconexao"] = pd.to_datetime(df_offline["data_desconexao"], errors='coerce')
    df_offline.dropna(subset=["data_desconexao"], inplace=True)
    
    agora_utc = datetime.now(timezone.utc)
    df_offline["data_desconexao"] = df_offline["data_desconexao"].apply(
        lambda x: x.tz_localize('UTC') if x.tzinfo is None else x.tz_convert('UTC')
    )
    df_offline["horas_offline"] = ((agora_utc - df_offline["data_desconexao"]).dt.total_seconds() / 3600).astype(int)
    df_offline["cidade"] = df_offline["olt_regiao"].apply(get_cidade_from_olt)

    numeric_cols = ['rx_onu', 'rx_olt', 'distancia_m']
    for col in numeric_cols:
        if col in df_offline.columns:
            df_offline[col] = pd.to_numeric(df_offline[col], errors='coerce').replace([np.inf, -np.inf], np.nan)
            if col == 'distancia_m':
                df_offline[col] = df_offline[col].astype('Int64')

    colunas_db = [
        "nome_cliente", "serial_onu", "olt_regiao", "data_desconexao", 
        "horas_offline", "cidade", "motivo_desconexao", "cto", "slot_pon_onu", 
        "modelo_onu", "rx_onu", "rx_olt", "distancia_m"
    ]
    
    for col in colunas_db:
        if col not in df_offline.columns:
            df_offline[col] = None

    df_offline["relatorio_id"] = relatorio_id
    
    df_final = df_offline[colunas_db + ["relatorio_id"]].copy()
    df_final = df_final.where(pd.notna(df_final), None)
    dados_para_inserir = df_final.to_dict("records")

    for record in dados_para_inserir:
        if record.get("data_desconexao"):
            record["data_desconexao"] = record["data_desconexao"].isoformat()

    if dados_para_inserir:
        logger.info(f"Inserindo {len(dados_para_inserir)} registros de clientes offline no DB.")
        insert_res = supabase_client.table('clientes_off').insert(dados_para_inserir).execute()
        if hasattr(insert_res, 'error') and insert_res.error:
            raise Exception(f"Falha ao salvar clientes no banco de dados: {insert_res.error}")

