from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class SalesDataPoint(BaseModel):
    date: str = Field(..., description="Sale date in YYYY-MM-DD format")
    quantity_sold: int = Field(..., ge=0, description="Quantity sold on this date")

class ForecastRequest(BaseModel):
    user_id: str = Field(..., description="User identifier")
    sku: str = Field(..., description="Product SKU to forecast")
    sales_history: List[SalesDataPoint] = Field(..., description="Historical sales data")
    current_stock: int = Field(..., ge=0, description="Current inventory level")
    lead_time_days: int = Field(default=7, ge=1, description="Supplier lead time in days")
    forecast_days: int = Field(default=7, ge=1, le=30, description="Number of days to forecast")

class ItemForecast(BaseModel):
    sku: str
    current_stock: int
    forecast_7_day: int
    recommended_order: int
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    trend: str = Field(..., description="Trend direction: increasing, decreasing, or stable")
    seasonality_detected: bool
    lead_time_factored: int
    model_used: str
    data_quality_score: float = Field(..., ge=0.0, le=1.0)

class ForecastResponse(BaseModel):
    forecast: Optional[ItemForecast] = None
    success: bool
    error_message: Optional[str] = None
    insufficient_data: bool = False
    data_quality_warnings: List[str] = []
    minimum_data_points_required: int = 14

class BatchForecastRequest(BaseModel):
    user_id: str
    items: List[ForecastRequest]

class BatchForecastResponse(BaseModel):
    forecasts: List[ItemForecast]
    insufficient_data_items: List[str]
    failed_items: List[Dict[str, str]]
    data_quality_warnings: List[str]