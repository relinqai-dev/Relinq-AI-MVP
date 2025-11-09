import pandas as pd
import numpy as np
from typing import Optional, NamedTuple
import logging
from models.forecasting_models import ARIMAForecaster, ProphetForecaster, ForecastResult
from models.api_models import ItemForecast

logger = logging.getLogger(__name__)

class ProcessedForecastResult(NamedTuple):
    success: bool
    forecast: Optional[ItemForecast] = None
    error_message: Optional[str] = None

class ForecastProcessor:
    """
    Processes forecasts and combines multiple models for better accuracy
    Factors in supplier lead times - Requirement 3.4
    Outputs structured data - Requirement 3.5
    """
    
    def __init__(self):
        self.arima_forecaster = ARIMAForecaster()
        self.prophet_forecaster = ProphetForecaster()
    
    async def generate_forecast(self, df: pd.DataFrame, sku: str, current_stock: int, 
                              lead_time_days: int, forecast_days: int = 7) -> ProcessedForecastResult:
        """
        Generate forecast using ensemble of models
        
        Args:
            df: DataFrame with date and quantity columns
            sku: Product SKU
            current_stock: Current inventory level
            lead_time_days: Supplier lead time
            forecast_days: Days to forecast
            
        Returns:
            ProcessedForecastResult with forecast or error
        """
        try:
            logger.info(f"Processing forecast for SKU: {sku}")
            
            # Generate forecasts from both models
            arima_result = self.arima_forecaster.fit_and_forecast(df, forecast_days)
            prophet_result = self.prophet_forecaster.fit_and_forecast(df, forecast_days)
            
            # Choose best model or ensemble
            best_result = self._select_best_forecast(arima_result, prophet_result)
            
            # Calculate total forecast demand
            total_forecast = int(np.sum(best_result.predictions))
            
            # Factor in lead time for reorder calculation
            lead_time_demand = self._calculate_lead_time_demand(
                best_result.predictions, lead_time_days, forecast_days
            )
            
            # Calculate recommended order quantity
            recommended_order = self._calculate_reorder_quantity(
                current_stock, total_forecast, lead_time_demand
            )
            
            # Create forecast result
            forecast = ItemForecast(
                sku=sku,
                current_stock=current_stock,
                forecast_7_day=total_forecast,
                recommended_order=recommended_order,
                confidence_score=best_result.confidence_score,
                trend=best_result.trend,
                seasonality_detected=best_result.seasonality_detected,
                lead_time_factored=lead_time_days,
                model_used=best_result.model_name,
                data_quality_score=best_result.data_quality_score or 0.8
            )
            
            return ProcessedForecastResult(success=True, forecast=forecast)
            
        except Exception as e:
            logger.error(f"Error processing forecast for SKU {sku}: {str(e)}")
            return ProcessedForecastResult(
                success=False,
                error_message=f"Forecast processing failed: {str(e)}"
            )
    
    def _select_best_forecast(self, arima_result: ForecastResult, 
                            prophet_result: ForecastResult) -> ForecastResult:
        """
        Select the best forecast result or create ensemble
        """
        # If one model failed, use the other
        if arima_result.confidence_score == 0:
            return prophet_result
        if prophet_result.confidence_score == 0:
            return arima_result
        
        # Use Prophet if it has higher confidence and detected seasonality
        if (prophet_result.confidence_score > arima_result.confidence_score * 1.1 and 
            prophet_result.seasonality_detected):
            return prophet_result
        
        # Use ARIMA for simpler patterns or when Prophet confidence is low
        if arima_result.confidence_score > prophet_result.confidence_score * 1.1:
            return arima_result
        
        # Create ensemble forecast
        ensemble_predictions = (arima_result.predictions + prophet_result.predictions) / 2
        ensemble_confidence = (arima_result.confidence_score + prophet_result.confidence_score) / 2
        
        # Use the trend and seasonality from the more confident model
        if prophet_result.confidence_score >= arima_result.confidence_score:
            trend = prophet_result.trend
            seasonality = prophet_result.seasonality_detected
        else:
            trend = arima_result.trend
            seasonality = arima_result.seasonality_detected
        
        return ForecastResult(
            predictions=ensemble_predictions,
            model_name="Ensemble-ARIMA-Prophet",
            trend=trend,
            seasonality_detected=seasonality,
            confidence_score=ensemble_confidence
        )
    
    def _calculate_lead_time_demand(self, predictions: np.ndarray, 
                                  lead_time_days: int, forecast_days: int) -> int:
        """
        Calculate expected demand during lead time period
        """
        if lead_time_days <= 0:
            return 0
        
        # If lead time is longer than forecast period, extrapolate
        if lead_time_days > forecast_days:
            daily_avg = np.mean(predictions)
            return int(daily_avg * lead_time_days)
        
        # Use actual forecast for lead time period
        return int(np.sum(predictions[:lead_time_days]))
    
    def _calculate_reorder_quantity(self, current_stock: int, forecast_demand: int, 
                                  lead_time_demand: int) -> int:
        """
        Calculate recommended reorder quantity
        
        Logic:
        - If current stock can cover forecast + lead time demand, no reorder needed
        - Otherwise, order enough to cover demand plus safety stock
        """
        # Safety stock (20% of forecast demand)
        safety_stock = int(forecast_demand * 0.2)
        
        # Total demand to cover
        total_demand = forecast_demand + lead_time_demand + safety_stock
        
        # Calculate reorder quantity
        if current_stock >= total_demand:
            return 0  # No reorder needed
        
        reorder_qty = total_demand - current_stock
        
        # Minimum order quantity (avoid very small orders)
        min_order = max(1, int(forecast_demand * 0.1))
        
        return max(reorder_qty, min_order)
    
    def _calculate_stockout_risk(self, current_stock: int, predictions: np.ndarray) -> dict:
        """
        Calculate stockout risk timeline
        """
        cumulative_demand = np.cumsum(predictions)
        stockout_day = None
        
        for day, demand in enumerate(cumulative_demand, 1):
            if demand > current_stock:
                stockout_day = day
                break
        
        return {
            "stockout_risk": stockout_day is not None,
            "stockout_day": stockout_day,
            "days_of_stock": len(predictions) if stockout_day is None else stockout_day - 1
        }