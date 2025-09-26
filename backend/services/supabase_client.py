import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Pega a URL e a Chave do Supabase a partir das variáveis de ambiente
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

# Validação para garantir que as variáveis foram carregadas
if not url or not key:
    raise ValueError("Supabase URL e Key devem ser definidas no arquivo .env")

# Cria uma instância única do cliente Supabase para ser usada em toda a aplicação
try:
    supabase: Client = create_client(url, key)
    print("Conexão com Supabase estabelecida com sucesso!")
except Exception as e:
    print(f"Erro ao conectar com Supabase: {e}")
    supabase = None
