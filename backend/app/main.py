import os
from typing import List

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, todos
from .database import create_tables

app = FastAPI(
    title="Todo List API",
    description="A simple todo list application API",
    version="1.0.0"
)

# 添加请求日志中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"=== REQUEST: {request.method} {request.url.path} ===")
    print(f"Headers: {dict(request.headers)}")
    if "authorization" in request.headers:
        auth_header = request.headers["authorization"]
        print(f"[OK] Authorization header found: {auth_header[:50]}...")
    else:
        print(f"[INFO] No Authorization header found")

    response = await call_next(request)
    print(f"=== RESPONSE: {response.status_code} ===")
    return response

def _build_allowed_origins() -> List[str]:
    default_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3003",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    extra_origins = os.getenv("CORS_ORIGINS")
    if extra_origins:
        default_origins.extend(
            origin.strip()
            for origin in extra_origins.split(",")
            if origin.strip()
        )

    # Deduplicate while preserving order
    seen = set()
    ordered = []
    for origin in default_origins:
        if origin not in seen and origin:
            seen.add(origin)
            ordered.append(origin)
    return ordered

app.add_middleware(
    CORSMiddleware,
    allow_origins=_build_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

create_tables()

app.include_router(auth.router)
app.include_router(todos.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Todo List API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
