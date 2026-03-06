import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import init_db
from app.db.redis_client import redis_client
from app.middleware.rate_limiter import RateLimitMiddleware
from app.websockets.vitals_stream import vitals_manager
from app.api.routes import auth, patients, triage, vitals, beds, clinical, appointments, analytics

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting CareHub AI...")
    await init_db()
    try:
        await redis_client.connect()
        logger.info("Redis connected")
    except Exception as e:
        logger.warning(f"Redis connection failed (non-critical): {e}")
    logger.info("CareHub AI started successfully")
    yield
    await redis_client.disconnect()
    logger.info("CareHub AI shutdown complete")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "AI-Powered Hospital Command Center — Real-time clinical intelligence, "
        "agentic triage, deterioration prediction, and hospital operations management."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
app.add_middleware(RateLimitMiddleware, max_requests=200, window_seconds=60)

# API Routes
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(patients.router, prefix=settings.API_PREFIX)
app.include_router(triage.router, prefix=settings.API_PREFIX)
app.include_router(vitals.router, prefix=settings.API_PREFIX)
app.include_router(beds.router, prefix=settings.API_PREFIX)
app.include_router(clinical.router, prefix=settings.API_PREFIX)
app.include_router(appointments.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)


# WebSocket endpoints
@app.websocket("/ws/vitals/{patient_id}")
async def vitals_websocket(websocket: WebSocket, patient_id: str):
    await vitals_manager.connect(websocket, patient_id)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        vitals_manager.disconnect(websocket, patient_id)


@app.websocket("/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    await vitals_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        vitals_manager.disconnect(websocket)


@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "modules": [
            "AI Triage Engine",
            "Deterioration Prediction (NEWS2)",
            "Clinical Decision Support",
            "Drug Interaction Checker",
            "Bed Management & Optimizer",
            "Real-time Vitals Streaming",
            "Patient Management",
            "Appointment Scheduling",
            "Analytics Dashboard",
        ],
        "websocket_endpoints": [
            "/ws/vitals/{patient_id}",
            "/ws/dashboard",
        ],
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "websocket_connections": vitals_manager.total_connections,
    }
