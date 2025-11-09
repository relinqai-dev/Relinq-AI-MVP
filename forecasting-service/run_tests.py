#!/usr/bin/env python3
"""
Comprehensive test runner for the forecasting service
Tests all advanced features and statistical models
"""

import sys
import os
import logging
import traceback
import time
from datetime import datetime, timedelta
import json

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_imports():
    """Test that all required modules can be imported"""
    logger.info("Testing module imports...")
    
    required_modules = [
        'fastapi',
        'uvicorn', 
        'pydantic',
        'pandas',
        'numpy',
        'scipy',
        'matplotlib',
        'python_dateutil'
    ]
    
    advanced_modules = [
        'sklearn',
        'statsmodels',
        'prophet',
        'pmdarima',
        'seaborn',
        'plotly'
    ]
    
    failed_required = []
    failed_advanced = []
    
    for module in required_modules:
        try:
            __import__(module)
            logger.info(f"✓ {module}")
        except ImportError as e:
            logger.error(f"✗ {module}: {e}")
            failed_required.append(module)
    
    for module in advanced_modules:
        try:
            __import__(module)
            logger.info(f"✓ {module} (advanced)")
        except ImportError as e:
            logger.warning(f"⚠ {module}: {e}")
            failed_advanced.append(module)
    
    if failed_required:
        logger.error(f"Required modules failed: {failed_required}")
        return False
    
    if failed_advanced:
        logger.warning(f"Advanced modules not available: {failed_advanced}")
        logger.warning("Some features will use fallback implementations")
    
    return True

def test_data_validation():
    """Test advanced data validation features"""
    logger.info("Testing data validation...")
    
    try:
        from services.data_validator import DataValidator
        from models.api_models import SalesDataPoint
        
        validator = DataValidator()
        
        # Test with realistic sales data
        sales_data = []
        base_date = datetime.now() - timedelta(days=30)
        
        import numpy as np
        
        for i in range(25):
            date_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
            # Realistic sales pattern with seasonality
            base_sales = 10 + 5 * np.sin(2 * np.pi * i / 7)
            noise = np.random.normal(0, 2)
            if i in [10, 20]:  # Add spikes
                base_sales += 20
            quantity = max(0, int(base_sales + noise))
            sales_data.append(SalesDataPoint(date=date_str, quantity_sold=quantity))
        
        result = validator.validate_sales_data(sales_data)
        
        assert result.is_valid, "Data validation should pass"
        assert not result.insufficient_data, "Should have sufficient data"
        assert 0.0 <= result.data_quality_score <= 1.0, "Quality score should be between 0 and 1"
        
        # Test anomaly detection
        import pandas as pd
        dates = pd.date_range(start='2024-01-01', periods=20, freq='D')
        quantities = [5, 6, 4, 5, 7, 25, 6, 5, 4, 0, 0, 0, 6, 5, 4, 30, 5, 6, 4, 5]
        df = pd.DataFrame({'date': dates, 'quantity': quantities})
        
        anomalies = validator.detect_data_anomalies(df)
        assert len(anomalies['sudden_spikes']) > 0, "Should detect spikes"
        
        logger.info("✓ Data validation tests passed")
        return True
        
    except Exception as e:
        logger.error(f"✗ Data validation test failed: {e}")
        traceback.print_exc()
        return False

def test_arima_forecasting():
    """Test ARIMA forecasting with advanced features"""
    logger.info("Testing ARIMA forecasting...")
    
    try:
        from models.forecasting_models import ARIMAForecaster
        import pandas as pd
        import numpy as np
        
        forecaster = ARIMAForecaster()
        
        # Create trending data
        dates = pd.date_range(start='2024-01-01', periods=30, freq='D')
        trend = np.linspace(5, 15, 30)
        noise = np.random.normal(0, 1, 30)
        quantities = np.maximum(0, trend + noise).astype(int)
        
        df = pd.DataFrame({'date': dates, 'quantity': quantities})
        
        result = forecaster.fit_and_forecast(df, forecast_days=7)
        
        assert len(result.predictions) == 7, "Should return 7 predictions"
        assert result.model_name.startswith("ARIMA"), "Should use ARIMA model"
        assert result.trend in ["increasing", "decreasing", "stable"], "Should detect trend"
        assert 0 <= result.confidence_score <= 1, "Confidence should be between 0 and 1"
        
        logger.info(f"✓ ARIMA test passed - Model: {result.model_name}, Confidence: {result.confidence_score:.3f}")
        return True
        
    except Exception as e:
        logger.error(f"✗ ARIMA test failed: {e}")
        traceback.print_exc()
        return False

def test_prophet_forecasting():
    """Test Prophet forecasting with advanced features"""
    logger.info("Testing Prophet forecasting...")
    
    try:
        from models.forecasting_models import ProphetForecaster
        import pandas as pd
        import numpy as np
        
        forecaster = ProphetForecaster()
        
        # Create data with clear weekly pattern
        dates = pd.date_range(start='2024-01-01', periods=35, freq='D')
        quantities = []
        
        for i, date in enumerate(dates):
            base_sales = 10
            if date.dayofweek in [5, 6]:  # Weekend boost
                base_sales += 5
            base_sales += i * 0.1  # Trend
            noise = np.random.normal(0, 1)
            quantities.append(max(0, int(base_sales + noise)))
        
        df = pd.DataFrame({'date': dates, 'quantity': quantities})
        
        result = forecaster.fit_and_forecast(df, forecast_days=7)
        
        assert len(result.predictions) == 7, "Should return 7 predictions"
        assert result.model_name.startswith("Prophet"), "Should use Prophet model"
        assert result.trend in ["increasing", "decreasing", "stable"], "Should detect trend"
        assert 0 <= result.confidence_score <= 1, "Confidence should be between 0 and 1"
        
        logger.info(f"✓ Prophet test passed - Seasonality: {result.seasonality_detected}, Confidence: {result.confidence_score:.3f}")
        return True
        
    except Exception as e:
        logger.error(f"✗ Prophet test failed: {e}")
        traceback.print_exc()
        return False

def test_forecast_processor():
    """Test the forecast processor with ensemble methods"""
    logger.info("Testing forecast processor...")
    
    try:
        from services.forecast_processor import ForecastProcessor
        import pandas as pd
        import numpy as np
        import asyncio
        
        processor = ForecastProcessor()
        
        # Create complex data
        dates = pd.date_range(start='2024-01-01', periods=28, freq='D')
        quantities = []
        
        for i, date in enumerate(dates):
            base = 8 + i * 0.2  # Trend
            seasonal = 3 * np.sin(2 * np.pi * i / 7)  # Weekly seasonality
            noise = np.random.normal(0, 1)
            quantities.append(max(0, int(base + seasonal + noise)))
        
        df = pd.DataFrame({'date': dates, 'quantity': quantities})
        
        # Test forecast generation
        result = asyncio.run(processor.generate_forecast(
            df=df,
            sku="TEST-SKU-001",
            current_stock=100,
            lead_time_days=5,
            forecast_days=7
        ))
        
        assert result.success, "Forecast should succeed"
        assert result.forecast is not None, "Should return forecast"
        assert result.forecast.sku == "TEST-SKU-001", "SKU should match"
        assert result.forecast.recommended_order >= 0, "Order should be non-negative"
        
        logger.info(f"✓ Forecast processor test passed - Model: {result.forecast.model_used}")
        return True
        
    except Exception as e:
        logger.error(f"✗ Forecast processor test failed: {e}")
        traceback.print_exc()
        return False

def test_api_endpoints():
    """Test API endpoints"""
    logger.info("Testing API endpoints...")
    
    try:
        from fastapi.testclient import TestClient
        from main import app
        
        client = TestClient(app)
        
        # Test health endpoint
        response = client.get("/health")
        assert response.status_code == 200, "Health check should return 200"
        
        # Test forecast endpoint
        sales_data = []
        base_date = datetime.now() - timedelta(days=20)
        for i in range(15):
            date_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
            sales_data.append({"date": date_str, "quantity_sold": 5 + i % 3})
        
        forecast_request = {
            "user_id": "test-user",
            "sku": "TEST-SKU",
            "sales_history": sales_data,
            "current_stock": 100,
            "lead_time_days": 7
        }
        
        response = client.post("/forecast", json=forecast_request)
        assert response.status_code == 200, "Forecast endpoint should return 200"
        
        data = response.json()
        assert data["success"], "Forecast should succeed"
        assert data["forecast"] is not None, "Should return forecast data"
        
        # Test metrics endpoint
        response = client.get("/metrics/performance")
        assert response.status_code == 200, "Metrics endpoint should return 200"
        
        logger.info("✓ API endpoints test passed")
        return True
        
    except Exception as e:
        logger.error(f"✗ API endpoints test failed: {e}")
        traceback.print_exc()
        return False

def test_performance():
    """Test performance with larger datasets"""
    logger.info("Testing performance...")
    
    try:
        from models.forecasting_models import ARIMAForecaster, ProphetForecaster
        import pandas as pd
        import numpy as np
        
        # Generate large dataset
        dates = pd.date_range(start='2023-01-01', periods=365, freq='D')
        quantities = np.random.poisson(10, 365)
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
        
        logger.info(f"ARIMA processing time: {arima_time:.2f}s")
        logger.info(f"Prophet processing time: {prophet_time:.2f}s")
        
        assert arima_time < 60, "ARIMA should complete within 60 seconds"
        assert prophet_time < 120, "Prophet should complete within 120 seconds"
        
        logger.info("✓ Performance test passed")
        return True
        
    except Exception as e:
        logger.error(f"✗ Performance test failed: {e}")
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    logger.info("🚀 Starting comprehensive forecasting service tests...")
    
    tests = [
        ("Module Imports", test_imports),
        ("Data Validation", test_data_validation),
        ("ARIMA Forecasting", test_arima_forecasting),
        ("Prophet Forecasting", test_prophet_forecasting),
        ("Forecast Processor", test_forecast_processor),
        ("API Endpoints", test_api_endpoints),
        ("Performance", test_performance),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        logger.info(f"\n{'='*50}")
        logger.info(f"Running: {test_name}")
        logger.info(f"{'='*50}")
        
        try:
            if test_func():
                passed += 1
                logger.info(f"✅ {test_name} PASSED")
            else:
                failed += 1
                logger.error(f"❌ {test_name} FAILED")
        except Exception as e:
            failed += 1
            logger.error(f"❌ {test_name} FAILED with exception: {e}")
            traceback.print_exc()
    
    logger.info(f"\n{'='*50}")
    logger.info(f"TEST SUMMARY")
    logger.info(f"{'='*50}")
    logger.info(f"Total tests: {len(tests)}")
    logger.info(f"Passed: {passed}")
    logger.info(f"Failed: {failed}")
    
    if failed == 0:
        logger.info("🎉 ALL TESTS PASSED! Forecasting service is fully operational.")
        return True
    else:
        logger.error(f"❌ {failed} tests failed. Please check the logs above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)