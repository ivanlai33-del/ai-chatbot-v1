import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    INTERNAL_SECRET = os.getenv("INTERNAL_COGNEE_SECRET", "default_secret_key")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    GRAPH_DB_URL = os.getenv("GRAPH_DB_URL", "")

config = Config()
