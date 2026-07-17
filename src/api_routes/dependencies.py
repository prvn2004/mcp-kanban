import os

API_KEY = os.getenv("MCP_UI_API_KEY", "dev-secret-key")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
SERVER_URL = os.getenv("SERVER_URL", "http://127.0.0.1:8000")
