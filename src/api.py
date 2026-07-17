from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware

from src.api_routes.dependencies import FRONTEND_URL, SERVER_URL
from src.api_routes.middleware import security_middleware
from src.api_routes.router import router
from src.core.exceptions import TicketNotFoundError, AuthorizationError, TicketError

app = FastAPI(title="Ticket Manager MCP API")

# Security: Strict CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, SERVER_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)

# Attach Security/Rate-Limiting Middleware
app.middleware("http")(security_middleware)

# Error Handling Exception Mappers
@app.exception_handler(TicketNotFoundError)
async def not_found_handler(request: Request, exc: TicketNotFoundError):
    return JSONResponse(
        status_code=404,
        content={"error": {"code": "NOT_FOUND", "message": str(exc)}}
    )

@app.exception_handler(AuthorizationError)
async def auth_error_handler(request: Request, exc: AuthorizationError):
    return JSONResponse(
        status_code=403,
        content={"error": {"code": "FORBIDDEN", "message": str(exc)}}
    )

@app.exception_handler(TicketError)
async def validation_error_handler(request: Request, exc: TicketError):
    return JSONResponse(
        status_code=422,
        content={"error": {"code": "VALIDATION_ERROR", "message": str(exc)}}
    )

# Include API Router
app.include_router(router, prefix="/api")

# --- UI Static File Serving ---
ui_path = Path(__file__).parent.parent / "ui" / "dist"

@app.get("/")
@app.get("/{full_path:path}")
def serve_spa(full_path: str = ""):
    if full_path.startswith("api/"):
        return JSONResponse(
            status_code=404,
            content={"error": {"code": "NOT_FOUND", "message": "API route not found"}}
        )
        
    file_path = ui_path / full_path
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)
    
    # Fallback to index.html for React Router SPA
    index_file = ui_path / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    
    return JSONResponse(
        status_code=404,
        content={"error": {"code": "UI_NOT_FOUND", "message": "UI build not found. Did you run 'npm run build'?"}}
    )
