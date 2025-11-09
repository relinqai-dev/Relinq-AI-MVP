"""
Health check endpoint for monitoring and load balancer
"""
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
import sys

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    python_version: str
    service: str


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint for monitoring services
    Returns service status and metadata
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        version="1.0.0",
        python_version=sys.version.split()[0],
        service="forecasting-service"
    )


@router.get("/ready")
async def readiness_check():
    """
    Readiness check for load balancer
    Verifies service is ready to accept requests
    """
    # Add checks for dependencies (database, ML models loaded, etc.)
    return {
        "ready": True,
        "timestamp": datetime.utcnow().isoformat()
    }
