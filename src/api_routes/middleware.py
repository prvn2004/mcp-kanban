import time
import logging
from collections import defaultdict
from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger("ticket_api")

RATE_LIMIT_WINDOW = 60 # 1 minute
RATE_LIMIT_MAX = 100
ip_requests = defaultdict(list)

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
