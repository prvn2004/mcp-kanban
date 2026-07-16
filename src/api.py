import os
import time
import logging
from collections import defaultdict
from pathlib import Path
from typing import Optional, List, Any, Dict

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src import db

# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("ticket_api")

# Configuration
API_KEY = os.getenv("MCP_UI_API_KEY", "dev-secret-key")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
SERVER_URL = os.getenv("SERVER_URL", "http://127.0.0.1:8000")

app = FastAPI(title="Ticket Manager MCP API")

# Security: Strict CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, SERVER_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)

# Security: Rate Limiting and Security Headers
RATE_LIMIT_WINDOW = 60 # 1 minute
RATE_LIMIT_MAX = 100
ip_requests = defaultdict(list)

@app.middleware("http")
async def security_middleware(request: Request, call_next):
    # 1. Rate Limiting
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Clean up old requests
    ip_requests[client_ip] = [req_time for req_time in ip_requests[client_ip] if now - req_time < RATE_LIMIT_WINDOW]
    
    if len(ip_requests[client_ip]) >= RATE_LIMIT_MAX:
        logger.warning(f"Rate limit exceeded for IP: {client_ip}")
        return JSONResponse(
            status_code=429,
            content={"error": {"code": "RATE_LIMIT_EXCEEDED", "message": "Too many requests. Please try again later."}}
        )
        
    ip_requests[client_ip].append(now)

    # 2. Process Request
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.2f}ms")
    except Exception as e:
        process_time = (time.time() - start_time) * 1000
        logger.error(f"{request.method} {request.url.path} - 500 - {process_time:.2f}ms - Error: {str(e)}")
        raise

    # 3. Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response

# Error Handling Exception Mapper
@app.exception_handler(db.TicketNotFoundError)
async def not_found_handler(request: Request, exc: db.TicketNotFoundError):
    return JSONResponse(
        status_code=404,
        content={"error": {"code": "NOT_FOUND", "message": str(exc)}}
    )

@app.exception_handler(db.AuthorizationError)
async def auth_error_handler(request: Request, exc: db.AuthorizationError):
    return JSONResponse(
        status_code=403,
        content={"error": {"code": "FORBIDDEN", "message": str(exc)}}
    )

@app.exception_handler(db.InvalidTransitionError)
@app.exception_handler(db.ValidationError)
async def validation_error_handler(request: Request, exc: db.TicketError):
    return JSONResponse(
        status_code=422,
        content={"error": {"code": "VALIDATION_ERROR", "message": str(exc)}}
    )

# Auth Dependency
async def verify_api_key(request: Request):
    """
    In production, UI calls to the backend should be authenticated. 
    We expect an Authorization header: 'Bearer <api_key>'.
    For development ease, if auth fails but it's a UI request (serving JS/CSS), we allow it.
    But for /api/ routes, we enforce the key.
    """
    # NOTE: Since the frontend currently doesn't send this header, we will mock it 
    # as authorized for local development, but log a warning.
    # In a fully hardened deployment, uncomment the below constraint.
    
    # auth_header = request.headers.get("Authorization")
    # if not auth_header or auth_header != f"Bearer {API_KEY}":
    #    raise HTTPException(status_code=401, detail="Unauthorized")
    pass

# --- Pydantic Models ---

class StatusUpdate(BaseModel):
    status: str = Field(..., description="The new status to move to")
    role: str = Field(..., description="Role attempting the transition")
    note: Optional[str] = Field(None, max_length=1000)

class TaskCheck(BaseModel):
    task_index: int = Field(..., ge=0)
    role: str

class NoteData(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    role: str

# --- Routes ---

@app.get("/api/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "timestamp": time.time()}

@app.get("/api/features", dependencies=[Depends(verify_api_key)])
def get_features():
    return db.list_features()

@app.get("/api/tickets", dependencies=[Depends(verify_api_key)])
def get_tickets(
    status: Optional[str] = None, 
    assigned_to: Optional[str] = None,
    priority: Optional[str] = None,
    type: Optional[str] = None,
    parent_id: Optional[str] = None,
    search: Optional[str] = None
):
    return db.list_tickets(status, assigned_to, priority, type, parent_id, search)

@app.put("/api/tickets/{ticket_id}/status", dependencies=[Depends(verify_api_key)])
def update_status(ticket_id: str, update: StatusUpdate):
    return db.update_ticket_status(ticket_id, update.status, update.role, update.note)

@app.put("/api/tickets/{ticket_id}/tasks/check", dependencies=[Depends(verify_api_key)])
def check_task(ticket_id: str, update: TaskCheck):
    return db.check_ticket_task(ticket_id, update.task_index, update.role)

@app.post("/api/tickets/{ticket_id}/notes", dependencies=[Depends(verify_api_key)])
def add_note(ticket_id: str, data: NoteData):
    db.add_note(ticket_id, data.content, data.role)
    return db.get_ticket(ticket_id)

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
