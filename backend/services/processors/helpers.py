import unicodedata
from typing import Dict, List

def normalize_text(text: str) -> str:
    """Função para limpar e padronizar texto."""
    if not isinstance(text, str):
        return ""
    nfkd_form = unicodedata.normalize('NFKD', text)
    ascii_text = nfkd_form.encode('ASCII', 'ignore').decode('utf-8')
    return ascii_text.lower().strip().replace(' ', '_').replace('-', '_').replace('(', '').replace(')', '')

def normalize_and_map_columns(df, column_aliases: Dict[str, List[str]]):
    """Normaliza as colunas do DataFrame e as renomeia com base em um dicionário de aliases."""
    
    df.columns = [normalize_text(col) for col in df.columns]
    
    rename_map = {}
    for db_col, aliases in column_aliases.items():
        # Adiciona o próprio nome da coluna de DB como um possível alias
        possible_names = [normalize_text(alias) for alias in [db_col] + aliases]
        for name in possible_names:
            if name in df.columns:
                rename_map[name] = db_col
                break # Pára no primeiro alias encontrado
    
    df.rename(columns=rename_map, inplace=True)
    return df
