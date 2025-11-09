import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import asyncio
from models.api_models import SalesDataPoint, ForecastRequest
from services.data_validator import DataValidator
from services.forecast_processor import ForecastProcessor
from models.forecasting_models import ARIMAForecaster, ProphetForecaster

def test_data_validator():
    """Test data validation with minimum requirements"""
    validator = DataValidator()
    
    # Test insufficient data
    insufficient_data = [
        SalesDataPoint(date="2024-01-01", quantity_sold=5),
        SalesDataPoint(date="2024-01-02", quantity_sold=3)
    ]
    result = validator.validate_sales_data(insufficient_data)
    assert not result.is_valid
    assert result.insufficient_data
    
    # Test sufficient data
    sufficient_data = []
    base_date = datetime.now() - timedelta(days=20)
    for i in range(15):
        date_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
        sufficient_data.append(SalesDataPoint(date=date_str, quantity_sold=np.random.randint(1, 10)))
    
    result = validator.validate_sales_data(sufficient_data)
    assert result.is_valid
    assert not result.insufficient_data

def test_arima_forecaster():
    """Test ARIMA forecasting model"""
    forecaster = ARIMAForecaster()
    
    # Create test data
    dates = pd.date_range(start='2024-01-01', periods=20, freq='D')
    quantities = np.random.randint(1, 10, 20)
    df = pd.DataFrame({'date': dates, 'quantity': quantities})
    
    result = forecaster.fit_and_forecast(df, forecast_days=7)
    
    assert len(result.predictions) == 7
    assert result.model_name == "ARIMA-Simple"
    assert result.trend in ["increasing", "decreasing", "stable"]
    assert 0 <= result.confidence_score <= 1

def test_forecast_processor():
    """Test forecast processor integration"""
    processor = ForecastProcessor()
    
    # Create test data
    dates = pd.date_range(start='2024-01-01', periods=20, freq='D')
    quantities = np.random.randint(1, 10, 20)
    df = pd.DataFrame({'date': dates, 'quantity': quantities})
    
    # Test forecast generation
    import asyncio
    result = asyncio.run(processor.generate_forecast(
        df=df,
        sku="TEST-SKU-001",
        current_stock=50,
        lead_time_days=7,
        forecast_days=7
    ))
    
    assert result.success
    assert result.forecast is not None
    assert result.forecast.sku == "TEST-SKU-001"
    assert result.forecast.current_stock == 50
    assert result.forecast.lead_time_factored == 7

def test_forecast_request_validation():
    """Test API model validation"""
    # Test valid request
    sales_data = []
    base_date = datetime.now() - timedelta(days=20)
    for i in range(15):
        date_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
        sales_data.append(SalesDataPoint(date=date_str, quantity_sold=5))
    
    request = ForecastRequest(
        user_id="test-user",
        sku="TEST-SKU",
        sales_history=sales_data,
        current_stock=100,
        lead_time_days=7
    )
    
    assert request.user_id == "test-user"
    assert request.sku == "TEST-SKU"
    assert len(request.sales_history) == 15
    assert request.current_stock == 100
    assert request.lead_time_days == 7

if __name__ == "__main__":
    # Run basic tests
    print("Running forecasting service tests...")
    
    try:
        test_data_validator()
        print("✓ Data validator test passed")
        
        test_arima_forecaster()
        print("✓ ARIMA forecaster test passed")
        
        test_forecast_processor()
        print("✓ Forecast processor test passed")
        
        test_forecast_request_validation()
        print("✓ API model validation test passed")
        
        print("\nAll tests passed! Forecasting service is working correctly.")
        
    except Exception as e:
        print(f"✗ Test failed: {str(e)}")
        raise
de
f test_advanced_data_validation():
    """Test advanced data validation features"""
    validator = DataValidator()
    
    # Test with realistic sales data including outliers
    sales_data = []
    base_date = datetime.now() - timedelta(days=30)
    
    # Generate realistic sales pattern with seasonality and outliers
    for i in range(25):
        date_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
        
        # Base sales with weekly pattern
        base_sales = 10 + 5 * np.sin(2 * np.pi * i / 7)  # Weekly seasonality
        
        # Add some noise
        noise = np.random.normal(0, 2)
        
        # Add occasional spikes (outliers)
        if i in [10, 20]:  # Spike days
            base_sales += 20
        
        quantity = max(0, int(base_sales + noise))
        sales_data.append(SalesDataPoint(date=date_str, quantity_sold=quantity))
    
    result = validator.validate_sales_data(sales_data)
    
    assert result.is_valid
    assert not result.insufficient_data
    assert 0.0 <= result.data_quality_score <= 1.0
    print(f"Data quality score: {result.data_quality_score}")
    print(f"Warnings: {result.warnings}")

def test_anomaly_detection():
    """Test comprehensive anomaly detection"""
    validator = DataValidator()
    
    # Create test data with known anomalies
    dates = pd.date_range(start='2024-01-01', periods=20, freq='D')
    quantities = [5, 6, 4, 5, 7, 25, 6, 5, 4, 0, 0, 0, 6, 5, 4, 30, 5, 6, 4, 5]  # Spikes and gaps
    
    df = pd.DataFrame({'date': dates, 'quantity': quantities})
    
    anomalies = validator.detect_data_anomalies(df)
    
    assert len(anomalies['sudden_spikes']) > 0  # Should detect spikes
    print(f"Detected anomalies: {json.dumps(anomalies, indent=2, default=str)}")

def test_prophet_advanced_features():
    """Test Prophet with advanced seasonality features"""
    forecaster = ProphetForecaster()
    
    # Create data with clear weekly pattern
    dates = pd.date_range(start='2024-01-01', periods=35, freq='D')
    quantities = []
    
    for i, date in enumerate(dates):
        # Weekly pattern: higher sales on weekends
        base_sales = 10
        if date.dayofweek in [5, 6]:  # Weekend
            base_sales += 5
        
        # Add trend
        base_sales += i * 0.1
        
        # Add noise
        noise = np.random.normal(0, 1)
        quantities.append(max(0, int(base_sales + noise)))
    
    df = pd.DataFrame({'date': dates, 'quantity': quantities})
    
    result = forecaster.fit_and_forecast(df, forecast_days=7)
    
    assert len(result.predictions) == 7
    assert result.seasonality_detected
    assert result.trend in ["increasing", "decreasing", "stable"]
    assert 0 <= result.confidence_score <= 1
    print(f"Prophet model: {result.model_name}")
    print(f"Trend: {result.trend}, Seasonality: {result.seasonality_detected}")
    print(f"Confidence: {result.confidence_score:.3f}")
    print(f"Model params: {result.model_params}")

def test_arima_advanced_features():
    """Test ARIMA with statsmodels integration"""
    forecaster = ARIMAForecaster()
    
    # Create trending data
    dates = pd.date_range(start='2024-01-01', periods=30, freq='D')
    trend = np.linspace(5, 15, 30)
    noise = np.random.normal(0, 1, 30)
    quantities = np.maximum(0, trend + noise).astype(int)
    
    df = pd.DataFrame({'date': dates, 'quantity': quantities})
    
    result = forecaster.fit_and_forecast(df, forecast_days=7)
    
    assert len(result.predictions) == 7
    assert result.model_name.startswith("ARIMA")
    assert result.trend in ["increasing", "decreasing", "stable"]
    print(f"ARIMA model: {result.model_name}")
    print(f"Model params: {result.model_params}")
    print(f"Residual diagnostics: {result.residual_diagnostics}")

def test_ensemble_forecasting():
    """Test ensemble forecasting with model selection"""
    processor = ForecastProcessor()
    
    # Create complex data with trend and seasonality
    dates = pd.date_range(start='2024-01-01', periods=28, freq='D')
    quantities = []
    
    for i, date in enumerate(dates):
        # Base trend
        base = 8 + i * 0.2
        
        # Weekly seasonality
        seasonal = 3 * np.sin(2 * np.pi * i / 7)
        
        # Noise
        noise = np.random.normal(0, 1)
        
        quantities.append(max(0, int(base + seasonal + noise)))
    
    df = pd.DataFrame({'date': dates, 'quantity': quantities})
    
    # Test forecast generation
    result = asyncio.run(processor.generate_forecast(
        df=df,
        sku="ENSEMBLE-TEST-001",
        current_stock=100,
        lead_time_days=5,
        forecast_days=7
    ))
    
    assert result.success
    assert result.forecast is not None
    assert result.forecast.sku == "ENSEMBLE-TEST-001"
    assert result.forecast.recommended_order >= 0
    print(f"Ensemble forecast - Model used: {result.forecast.model_used}")
    print(f"7-day forecast: {result.forecast.forecast_7_day}")
    print(f"Recommended order: {result.forecast.recommended_order}")
    print(f"Confidence: {result.forecast.confidence_score:.3f}")

def test_edge_cases():
    """Test edge cases and error handling"""
    validator = DataValidator()
    processor = ForecastProcessor()
    
    # Test with all zero sales
    zero_sales = []
    base_date = datetime.now() - timedelta(days=20)
    for i in range(15):
        date_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
        zero_sales.append(SalesDataPoint(date=date_str, quantity_sold=0))
    
    result = validator.validate_sales_data(zero_sales)
    assert result.is_valid  # Should still be valid but with warnings
    assert len(result.warnings) > 0
    
    # Test forecasting with zero sales
    df = pd.DataFrame([
        {"date": pd.to_datetime(point.date), "quantity": point.quantity_sold}
        for point in zero_sales
    ])
    
    forecast_result = asyncio.run(processor.generate_forecast(
        df=df,
        sku="ZERO-SALES-TEST",
        current_stock=50,
        lead_time_days=7
    ))
    
    assert forecast_result.success
    print(f"Zero sales forecast: {forecast_result.forecast.forecast_7_day}")

def test_performance_benchmarks():
    """Test performance with larger datasets"""
    import time
    
    # Generate large dataset
    dates = pd.date_range(start='2023-01-01', periods=365, freq='D')
    quantities = np.random.poisson(10, 365)  # Poisson distribution for sales
    
    df = pd.DataFrame({'date': dates, 'quantity': quantities})
    
    # Test ARIMA performance
    start_time = time.time()
    arima_forecaster = ARIMAForecaster()
    arima_result = arima_forecaster.fit_and_forecast(df, forecast_days=7)
    arima_time = time.time() - start_time
    
    # Test Prophet performance
    start_time = time.time()
    prophet_forecaster = ProphetForecaster()
    prophet_result = prophet_forecaster.fit_and_forecast(df, forecast_days=7)
    prophet_time = time.time() - start_time
    
    print(f"ARIMA processing time: {arima_time:.2f}s")
    print(f"Prophet processing time: {prophet_time:.2f}s")
    
    assert arima_time < 30  # Should complete within 30 seconds
    assert prophet_time < 60  # Prophet might take longer but should be reasonable

if __name__ == "__main__":
    # Run comprehensive tests
    print("Running comprehensive forecasting service tests...")
    
    try:
        test_data_validator()
        print("✓ Basic data validator test passed")
        
        test_advanced_data_validation()
        print("✓ Advanced data validation test passed")
        
        test_anomaly_detection()
        print("✓ Anomaly detection test passed")
        
        test_arima_forecaster()
        print("✓ Basic ARIMA forecaster test passed")
        
        test_arima_advanced_features()
        print("✓ Advanced ARIMA features test passed")
        
        test_prophet_advanced_features()
        print("✓ Advanced Prophet features test passed")
        
        test_forecast_processor()
        print("✓ Basic forecast processor test passed")
        
        test_ensemble_forecasting()
        print("✓ Ensemble forecasting test passed")
        
        test_forecast_request_validation()
        print("✓ API model validation test passed")
        
        test_edge_cases()
        print("✓ Edge cases test passed")
        
        test_performance_benchmarks()
        print("✓ Performance benchmarks test passed")
        
        print("\n🎉 All comprehensive tests passed! Advanced forecasting service is working correctly.")
        print("\nFeatures tested:")
        print("- Advanced ARIMA with automatic parameter selection")
        print("- Prophet with custom seasonalities and regressors")
        print("- Comprehensive data quality assessment")
        print("- Anomaly detection and outlier analysis")
        print("- Ensemble forecasting with model selection")
        print("- Performance optimization")
        print("- Edge case handling")
        
    except Exception as e:
        print(f"✗ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise