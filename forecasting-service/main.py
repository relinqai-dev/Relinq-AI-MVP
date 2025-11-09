from fastapi import FastAPI, HTTPException, Query
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from models.api_models import (
    SalesDataPoint, ForecastRequest, ItemForecast, ForecastResponse,
    BatchForecastRequest, BatchForecastResponse
)
from services.data_validator import DataValidator
from services.forecast_processor import ForecastProcessor
from services.monitoring import performance_monitor, ForecastTimer
from config.model_config import LOGGING_CONFIG
from health_check import router as health_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOGGING_CONFIG['level']),
    format=LOGGING_CONFIG['format']
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Smart Inventory Forecasting Engine",
    description="AI-powered demand forecasting microservice for retail inventory management with advanced monitoring",
    version="2.0.0"
)

# Include health check router
app.include_router(health_router)

# Initialize services
data_validator = DataValidator()
forecast_processor = ForecastProcessor()

@app.post("/forecast", response_model=ForecastResponse)
async def generate_forecast(request: ForecastRequest):
    """
    Generate demand forecast for a single item with performance monitoring
    """
    with ForecastTimer(request.sku, request.user_id) as timer:
        try:
            logger.info(f"Generating forecast for SKU: {request.sku}, User: {request.user_id}")
            
            # Validate input data
            validation_result = data_validator.validate_sales_data(request.sales_history)
            
            if not validation_result.is_valid:
                timer.record_metrics(
                    model_used="validation_failed",
                    data_points=len(request.sales_history),
                    forecast_days=request.forecast_days,
                    confidence_score=0.0,
                    data_quality_score=validation_result.data_quality_score,
                    success=False,
                    error_message=validation_result.error_message
                )
                
                return ForecastResponse(
                    success=False,
                    insufficient_data=validation_result.insufficient_data,
                    error_message=validation_result.error_message,
                    data_quality_warnings=validation_result.warnings
                )
            
            # Convert to DataFrame for processing
            df = pd.DataFrame([
                {"date": pd.to_datetime(point.date), "quantity": point.quantity_sold}
                for point in request.sales_history
            ])
            
            # Generate forecast using both models
            forecast_result = await forecast_processor.generate_forecast(
                df=df,
                sku=request.sku,
                current_stock=request.current_stock,
                lead_time_days=request.lead_time_days,
                forecast_days=request.forecast_days
            )
            
            if forecast_result.success:
                # Record successful forecast metrics
                timer.record_metrics(
                    model_used=forecast_result.forecast.model_used,
                    data_points=len(request.sales_history),
                    forecast_days=request.forecast_days,
                    confidence_score=forecast_result.forecast.confidence_score,
                    data_quality_score=forecast_result.forecast.data_quality_score,
                    success=True
                )
                
                return ForecastResponse(
                    forecast=forecast_result.forecast,
                    success=True,
                    data_quality_warnings=validation_result.warnings
                )
            else:
                # Record failed forecast metrics
                timer.record_metrics(
                    model_used="forecast_failed",
                    data_points=len(request.sales_history),
                    forecast_days=request.forecast_days,
                    confidence_score=0.0,
                    data_quality_score=validation_result.data_quality_score,
                    success=False,
                    error_message=forecast_result.error_message
                )
                
                return ForecastResponse(
                    success=False,
                    error_message=forecast_result.error_message,
                    data_quality_warnings=validation_result.warnings
                )
                
        except Exception as e:
            error_msg = f"Internal server error: {str(e)}"
            logger.error(f"Error generating forecast for SKU {request.sku}: {error_msg}")
            
            # Record exception metrics
            timer.record_metrics(
                model_used="exception",
                data_points=len(request.sales_history),
                forecast_days=request.forecast_days,
                confidence_score=0.0,
                data_quality_score=0.0,
                success=False,
                error_message=error_msg
            )
            
            return ForecastResponse(
                success=False,
                error_message=error_msg
            )

@app.post("/forecast/batch", response_model=BatchForecastResponse)
async def generate_batch_forecast(request: BatchForecastRequest):
    """
    Generate forecasts for multiple items
    """
    try:
        logger.info(f"Generating batch forecast for {len(request.items)} items, User: {request.user_id}")
        
        forecasts = []
        insufficient_data_items = []
        failed_items = []
        all_warnings = []
        
        for item_request in request.items:
            try:
                # Generate individual forecast
                forecast_response = await generate_forecast(item_request)
                
                if forecast_response.success and forecast_response.forecast:
                    forecasts.append(forecast_response.forecast)
                elif forecast_response.insufficient_data:
                    insufficient_data_items.append(item_request.sku)
                else:
                    failed_items.append({
                        "sku": item_request.sku,
                        "error": forecast_response.error_message or "Unknown error"
                    })
                
                # Collect warnings
                if forecast_response.data_quality_warnings:
                    all_warnings.extend(forecast_response.data_quality_warnings)
                    
            except Exception as e:
                logger.error(f"Error processing item {item_request.sku}: {str(e)}")
                failed_items.append({
                    "sku": item_request.sku,
                    "error": str(e)
                })
        
        return BatchForecastResponse(
            forecasts=forecasts,
            insufficient_data_items=insufficient_data_items,
            failed_items=failed_items,
            data_quality_warnings=list(set(all_warnings))  # Remove duplicates
        )
        
    except Exception as e:
        logger.error(f"Error in batch forecast: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/metrics/performance")
async def get_performance_metrics(hours: int = Query(default=24, ge=1, le=168)):
    """
    Get performance metrics for the specified time period
    """
    try:
        summary = performance_monitor.get_performance_summary(hours=hours)
        return {
            "status": "success",
            "data": summary,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error retrieving performance metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/metrics/models")
async def get_model_performance():
    """
    Get comparative performance metrics across different forecasting models
    """
    try:
        comparison = performance_monitor.get_model_performance_comparison()
        return {
            "status": "success",
            "data": comparison,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error retrieving model performance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/metrics/export")
async def export_metrics(format: str = Query(default="json", regex="^(json)$")):
    """
    Export all collected metrics in the specified format
    """
    try:
        exported_data = performance_monitor.export_metrics(format=format)
        return {
            "status": "success",
            "format": format,
            "data": exported_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error exporting metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/metrics")
async def clear_metrics():
    """
    Clear all stored performance metrics
    """
    try:
        performance_monitor.clear_metrics()
        return {
            "status": "success",
            "message": "All metrics cleared successfully",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error clearing metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/config")
async def get_service_configuration():
    """
    Get current service configuration
    """
    try:
        from config.model_config import (
            DATA_VALIDATION, ARIMA_CONFIG, PROPHET_CONFIG, 
            ENSEMBLE_CONFIG, FORECAST_CONFIG, API_CONFIG
        )
        
        return {
            "status": "success",
            "configuration": {
                "data_validation": DATA_VALIDATION,
                "arima_config": ARIMA_CONFIG,
                "prophet_config": PROPHET_CONFIG,
                "ensemble_config": ENSEMBLE_CONFIG,
                "forecast_config": FORECAST_CONFIG,
                "api_config": API_CONFIG
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error retrieving configuration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)