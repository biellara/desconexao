import pandas as pd
import numpy as np
from datetime import datetime, timezone
from typing import Dict, Any

# --- MAPEAMENTO DE OLT PARA CIDADE ---
# Adicione ou modifique este dicionário conforme sua necessidade.
# A chave é o nome da OLT/Região como aparece no relatório.
# O valor é o nome da cidade que você quer exibir no gráfico.
OLT_CIDADE_MAP = {
    # Londrina
    "OLT-LDB-HUAWEI-DC": "Londrina",
    "OLT-LDB-HUAWEI-OSCAR": "Londrina",
    "OLT-LDB-HUAWEI-ZONA-NORTE": "Londrina",
    "OLT-LDB-HUAWEI-10-DEZEMBRO": "Londrina",
    "OLT-LDB-HUAWEI-ANA-ROSA": "Londrina",
    "OLT-LDB-HUAWEI-CATUAI": "Londrina",
    "OLT-LDB-HUAWEI-COLUMBIA": "Londrina",
    "OLT-LDB-HUAWEI-HU": "Londrina",
    "OLT-LDB-HUAWEI-PARK-UNIVERSITARIO": "Londrina",
    "OLT-LDB-HUAWEI-SPAZIO-LYON": "Londrina",
    "OLT-LDB-HUAWEI-UTF-PR": "Londrina",
    "OLT-LDB-HUAWEI-UTF-PR-2": "Londrina",
    "OLT-LDB-FH-OSCAR": "Londrina",
    "OLT-LDB-HUAWEI-DC-02": "Londrina",

    # Jataizinho
    "OLT-JZN -HUAWEI-JATAIZINHO": "Jataizinho",

    # Paiçandu
    "OLT-PNU-ZTE-PAICANDU-01": "Paiçandu",

    # Maringá
    "OLT-MGF-ZTE-SERENITY-02": "Maringá",
    "OLT-MGF-ZTE-GETULIO-03": "Maringá",
    "OLT-MGF-PARKS-MUSCAT-54": "Maringá",
    "OLT-MGF-PARKS-EDF-HAVANA-53": "Maringá",
    "OLT-MGF-PARKS-EDF-SOLARIS-52": "Maringá",
    "OLT-MGF-PARKS-EDF-HAVANA-51": "Maringá",
    "OLT-MGF-PARKS-SUMARE-40": "Maringá",
    "OLT-MGF-PARKS-EDF-PORTAL-JAPAO-16": "Maringá",
    "OLT-MGF-PARKS-EDF-HAVANA-12": "Maringá",
    "OLT-MGF-PARKS-EDF-HAVANA-11": "Maringá",
    "OLT-MGF-PARKS-MUSCAT-10": "Maringá",
    "OLT-MGF-PARKS-INFINITY-09": "Maringá",
    "OLT-MGF-PARKS-MISATO-08": "Maringá",
    "OLT-MGF-PARKS-MUSCAT-07": "Maringá",
    "OLT-MGF-PARKS-DELTA-06": "Maringá",
    "OLT-MGF-PARKS-DELTA-05": "Maringá",
    "OLT-MGF-PARKS-ORIENTAL-04": "Maringá",
    "OLT-MGF-PARKS-MARINGA-02": "Maringá",
    "OLT-MGF-PARKS-MARINGA-01": "Maringá",
    "OLT-MGF-FH-GUAIAPO-01": "Maringá",
    "OLT-MGF-FH-GUAIAPO-04": "Maringá",
    "OLT-MGF-FH-ORIENTAL-06": "Maringá",
    "OLT-MGF-PARKS-ORIENTAL-04---MIGRAÇÃO": "Maringá",
    "OLT-MGF-PARKS-TESTE": "Maringá",

    # Marialva
    "OLT-MRV-PARKS-MARIALVA-50": "Marialva",
    "OLT-MRV-PARKS-MARIALVA-49": "Marialva",
    "OLT-MRV-PARKS-MARIALVA-48": "Marialva",
    "OLT-MRV-PARKS-MARIALVA-47": "Marialva",
    "OLT-MRV-PARKS-MARIALVA-46": "Marialva",
    "OLT-MRV-PARKS-MARIALVA-45": "Marialva",
    "OLT-MRV-PARKS-MARIALVA-44": "Marialva",
    "OLT-MRV-PARKS-MARIALVA-43": "Marialva",
    "OLT-MRV-PARKS-MARIALVA-42": "Marialva",
    "OLT-MRV-PARKS-MARIALVA-41": "Marialva",
    "OLT-MRV-FH-MARIALVA-07": "Marialva",

    # Alvorada do Sul
    "OLT-AVL-PARKS-ALVORADA-DO-SUL-38": "Alvorada do Sul",
    "OLT-AVL-PARKS-ALVORADA-DO-SUL-37": "Alvorada do Sul",
    "OLT-AVL-PARKS-ALVORADA-DO-SUL-36": "Alvorada do Sul",
    "OLT-AVL-PARKS-ALVORADA-DO-SUL-35": "Alvorada do Sul",
    "OLT-AVL-PARKS-ALVORADA-DO-SUL-34": "Alvorada do Sul",

    # Porecatu
    "OLT-PRU-PARKS-PORECATU-CONDOMINIO-33": "Porecatu",
    "OLT-PRU-PARKS-PORECATU-CONDOMINIO-32": "Porecatu",
    "OLT-PRU-PARKS-PORECATU-31": "Porecatu",
    "OLT-PRU-PARKS-PORECATU-30": "Porecatu",
    "OLT-PRU-PARKS-PORECATU-29": "Porecatu",
    "OLT-PRU-PARKS-PORECATU-28": "Porecatu",
    "OLT-PRU-PARKS-PORECATU-27": "Porecatu",

    # Sabáudia
    "OLT-SDY-PARKS-SABAUDIA-26": "Sabáudia",
    "OLT-SDY-PARKS-SABAUDIA-25": "Sabáudia",
    "OLT-SDY-PARKS-SABAUDIA-24": "Sabáudia",
    "OLT-SDY-PARKS-SABAUDIA-23": "Sabáudia",

    # Florestópolis
    "OLT-FOS-PARKS-FLORESTOPOLIS-22": "Florestópolis",
    "OLT-FOS-PARKS-FLORESTOPOLIS-21": "Florestópolis",
    "OLT-FOS-PARKS-FLORESTOPOLIS-20": "Florestópolis",
    "OLT-FOS-PARKS-FLORESTOPOLIS-19": "Florestópolis",
    "OLT-FOS-PARKS-FLORESTOPOLIS-18": "Florestópolis",
    "OLT-FOS-PARKS-FLORESTOPOLIS-17": "Florestópolis",

    # Prado Ferreira
    "OLT-PFI-PARKS-PRADO-FERREIRA-15": "Prado Ferreira",
    "OLT-PFI-PARKS-PRADO-FERREIRA-14": "Prado Ferreira",
    "OLT-PFI-PARKS-PRADO-FERREIRA-13": "Prado Ferreira",

    # Sarandi
    "OLT-SWW-PARKS-SARANDI-03": "Sarandi",
    "OLT-SWW-FH-SARANDI-05": "Sarandi",
    "OLT-SWW-FH-SARANDI-08-POP2": "Sarandi",
    "OLT-SWW-FH-SARANDI-09-POP3": "Sarandi",

    # Apucarana
    "OLT-APU-FH-COLONIAL": "Apucarana",
    "OLT-APU-FH-CUBA": "Apucarana",
    "OLT-APU-FH-VENEZA": "Apucarana",
    "OLT-APU-FH-WIZARD": "Apucarana",
    "OLT-APU-FH-SEDE": "Apucarana",

    # Arapongas
    "OLT-APS-FH-AGUIA": "Arapongas",
    "OLT-APS-FH-UNOPAR": "Arapongas",

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
    "OLT-RLA-FH-POP-01": "Rolândia",
    "OLT-RLA-FH-POP-02": "Rolândia",
    "OLT-RLA-FH-POP-03": "Rolândia",

    # Astorga
    "OLT-ATG-FH-ASTORGA-02": "Astorga",

    # Jaguapitã
    "OLT-JGP-FH-JAGUAPITA-03": "Jaguapitã",

    # Outros (bancada / teste)
    "OLT-PARKS-BANCADA": "Laboratório",
    "OLT-ZTE-BANCADA": "Laboratório",
}


def get_cidade_from_olt(olt_regiao):
    """Retorna a cidade correspondente a uma OLT ou 'Outra' se não encontrar."""
    return OLT_CIDADE_MAP.get(olt_regiao, 'Outra')


def processar_relatorio(df: pd.DataFrame, relatorio_id: int) -> list[Dict[str, Any]]:
    """
    Processa um DataFrame de relatório para encontrar clientes offline > 48h.
    """

    # 🔥 Normaliza colunas para evitar problemas de acento/espaco/maiúscula
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
        .str.replace("á", "a")
        .str.replace("ã", "a")
        .str.replace("â", "a")
        .str.replace("é", "e")
        .str.replace("ê", "e")
        .str.replace("í", "i")
        .str.replace("ó", "o")
        .str.replace("ô", "o")
        .str.replace("õ", "o")
        .str.replace("ú", "u")
        .str.replace("ç", "c")
    )

    # Mapeamento flexível → aceita múltiplas variações
    colunas_map = {
        "nome_cliente": "nome_cliente",
        "cliente": "nome_cliente",

        "serial_onu": "serial_onu",
        "sn_onu": "serial_onu",

        "olt": "olt_regiao",

        "status": "status_conexao",

        "ultima_comunicacao": "data_desconexao",
        "ultima_alteracao_de_status": "data_desconexao"
    }

    # Renomeia colunas encontradas
    df.rename(columns={col: colunas_map[col] for col in df.columns if col in colunas_map}, inplace=True)

    # Verifica colunas obrigatórias
    colunas_necessarias = ["status_conexao", "data_desconexao"]
    if not all(col in df.columns for col in colunas_necessarias):
        raise ValueError(
            "O arquivo não contém as colunas necessárias: 'Status' e ('Ultima Comunicacao' ou 'Última Alteração de Status')"
        )

    # 🔎 Filtra clientes offline
    df_loss = df[df["status_conexao"].str.strip().str.upper() == "LOSS"].copy()
    if df_loss.empty:
        return []

    # Converte data
    df_loss["data_desconexao"] = pd.to_datetime(df_loss["data_desconexao"], errors="coerce")
    df_loss.dropna(subset=["data_desconexao"], inplace=True)

    agora_utc = datetime.now(timezone.utc)
    df_loss["data_desconexao"] = df_loss["data_desconexao"].dt.tz_localize("UTC", ambiguous="infer")
    df_loss["horas_offline"] = (agora_utc - df_loss["data_desconexao"]).dt.total_seconds() / 3600

    # Só clientes offline > 48h
    df_off_48h = df_loss[df_loss["horas_offline"] > 48].copy()
    if df_off_48h.empty:
        return []

    df_off_48h["relatorio_id"] = relatorio_id
    df_off_48h["horas_offline"] = df_off_48h["horas_offline"].astype(int)

    # Cidade pela OLT
    df_off_48h["cidade"] = df_off_48h["olt_regiao"].apply(get_cidade_from_olt)

    colunas_para_db = [
        "relatorio_id", "nome_cliente", "serial_onu",
        "olt_regiao", "data_desconexao", "horas_offline", "cidade"
    ]

    for col in colunas_para_db:
        if col not in df_off_48h.columns:
            df_off_48h[col] = None

    df_final = df_off_48h[colunas_para_db].copy()
    df_final.replace([np.inf, -np.inf], np.nan, inplace=True)
    dados_para_inserir = df_final.where(pd.notna(df_final), None).to_dict("records")

    for record in dados_para_inserir:
        if record.get("data_desconexao"):
            record["data_desconexao"] = record["data_desconexao"].isoformat()

    return dados_para_inserir

