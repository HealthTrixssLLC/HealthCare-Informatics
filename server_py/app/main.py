"""Main FastAPI application."""
import time
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import json

from app.routes import router
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    print(f"Starting FastAPI server on {settings.HOST}:{settings.PORT}")
    print(f"Environment: {settings.ENVIRONMENT}")
    print(f"FHIR Server: {settings.FHIR_BASE_URL}")
    yield
    print("Shutting down server...")


app = FastAPI(
    title="Healthcare Informatics API",
    description="AI-powered healthcare analytics with FHIR data",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all API requests."""
    start_time = time.time()
    
    # Capture response
    response = await call_next(request)
    
    # Calculate duration
    duration = (time.time() - start_time) * 1000  # ms
    
    # Log API requests
    if request.url.path.startswith("/api"):
        log_line = f"{request.method} {request.url.path} {response.status_code} in {duration:.0f}ms"
        
        # Limit log line length
        if len(log_line) > 80:
            log_line = log_line[:79] + "…"
        
        print(log_line)
    
    return response


# Error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    status_code = getattr(exc, "status_code", 500)
    message = str(exc) if str(exc) else "Internal Server Error"
    
    print(f"Error handling {request.method} {request.url.path}: {message}")
    
    return Response(
        content=json.dumps({"message": message}),
        status_code=status_code,
        media_type="application/json"
    )


# Include routers
app.include_router(router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Healthcare Informatics API",
        "version": "2.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )
