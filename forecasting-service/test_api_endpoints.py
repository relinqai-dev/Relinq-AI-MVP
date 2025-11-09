#!/usr/bin/env python3
"""
Comprehensive API endpoint testing for the forecasting service
Tests all endpoints with real requests and validates responses
"""

import requests
import json
import time
from datetime import datetime, timedelta
import sys
import threading
import subprocess
import os

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_TIMEOUT = 30

def start_server():
    """Start the forecasting service in background"""
    print("🚀 Starting forecasting service...")
    
    # Start server process
    process = subprocess.Popen([
        sys.executable, "main.py"
    ], cwd=os.path.dirname(os.path.abspath(__file__)))
    
    # Wait for server to start
    for i in range(10):
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=2)
            if response.status_code == 200:
                print("✅ Server started successfully")
                return process
        except:
            time.sleep(1)
    
    print("❌ Failed to start server")
    return None

def test_health_endpoint():
    """Test health check endpoint"""
    print("\n📋 Testing /health endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "status" in data, "Response missing 'status' field"
        assert data["status"] == "healthy", f"Expected 'healthy', got {data['status']}"
        assert "timestamp" in data, "Response missing 'timestamp' field"
        
        print("✅ Health endpoint working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Health endpoint failed: {e}")
        return False

def test_forecast_endpoint():
    """Test single item forecast endpoint"""
    print("\n📊 Testing /forecast endpoint...")
    
    # Create test data
    sales_data = []
    base_date = datetime.now() - timedelta(days=20)
    
    for i in range(15):
        date_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
        # Create realistic sales pattern
        base_sales = 8 + (i % 7) * 2  # Weekly pattern
        sales_data.append({
            "date": date_str,
            "quantity_sold": base_sales
        })
    
    forecast_request = {
        "user_id": "test-user-001",
        "sku": "TEST-PRODUCT-001",
        "sales_history": sales_data,
        "current_stock": 100,
        "lead_time_days": 7,
        "forecast_days": 7
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/forecast", 
            json=forecast_request,
            timeout=TEST_TIMEOUT
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate response structure
        assert "success" in data, "Response missing 'success' field"
        assert data["success"] == True, f"Forecast failed: {data.get('error_message', 'Unknown error')}"
        
        assert "forecast" in data, "Response missing 'forecast' field"
        forecast = data["forecast"]
        
        # Validate forecast structure
        required_fields = [
            "sku", "current_stock", "forecast_7_day", "recommended_order",
            "confidence_score", "trend", "seasonality_detected", 
            "lead_time_factored", "model_used", "data_quality_score"
        ]
        
        for field in required_fields:
            assert field in forecast, f"Forecast missing required field: {field}"
        
        # Validate field values
        assert forecast["sku"] == "TEST-PRODUCT-001", "SKU mismatch"
        assert forecast["current_stock"] == 100, "Current stock mismatch"
        assert forecast["forecast_7_day"] >= 0, "Forecast should be non-negative"
        assert forecast["recommended_order"] >= 0, "Recommended order should be non-negative"
        assert 0 <= forecast["confidence_score"] <= 1, "Confidence score should be between 0 and 1"
        assert forecast["trend"] in ["increasing", "decreasing", "stable"], "Invalid trend value"
        assert forecast["lead_time_factored"] == 7, "Lead time mismatch"
        assert 0 <= forecast["data_quality_score"] <= 1, "Data quality score should be between 0 and 1"
        
        print("✅ Forecast endpoint working correctly")
        print(f"   Model used: {forecast['model_used']}")
        print(f"   7-day forecast: {forecast['forecast_7_day']}")
        print(f"   Recommended order: {forecast['recommended_order']}")
        print(f"   Confidence: {forecast['confidence_score']:.3f}")
        print(f"   Trend: {forecast['trend']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Forecast endpoint failed: {e}")
        return False

def test_batch_forecast_endpoint():
    """Test batch forecast endpoint"""
    print("\n📊 Testing /forecast/batch endpoint...")
    
    # Create test data for multiple items
    items = []
    for i in range(3):
        sales_data = []
        base_date = datetime.now() - timedelta(days=20)
        
        for j in range(15):
            date_str = (base_date + timedelta(days=j)).strftime("%Y-%m-%d")
            base_sales = 5 + i * 3 + (j % 7)  # Different patterns per item
            sales_data.append({
                "date": date_str,
                "quantity_sold": base_sales
            })
        
        items.append({
            "user_id": "test-user-001",
            "sku": f"TEST-PRODUCT-{i+1:03d}",
            "sales_history": sales_data,
            "current_stock": 50 + i * 25,
            "lead_time_days": 5 + i,
            "forecast_days": 7
        })
    
    batch_request = {
        "user_id": "test-user-001",
        "items": items
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/forecast/batch", 
            json=batch_request,
            timeout=TEST_TIMEOUT * 2  # Longer timeout for batch
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        print(f"Batch response summary: {len(data.get('forecasts', []))} forecasts generated")
        
        # Validate response structure
        assert "forecasts" in data, "Response missing 'forecasts' field"
        assert "insufficient_data_items" in data, "Response missing 'insufficient_data_items' field"
        assert "failed_items" in data, "Response missing 'failed_items' field"
        
        forecasts = data["forecasts"]
        assert len(forecasts) > 0, "No forecasts generated"
        
        # Validate each forecast
        for forecast in forecasts:
            assert "sku" in forecast, "Forecast missing SKU"
            assert "forecast_7_day" in forecast, "Forecast missing 7-day prediction"
            assert forecast["forecast_7_day"] >= 0, "Forecast should be non-negative"
        
        print("✅ Batch forecast endpoint working correctly")
        print(f"   Generated {len(forecasts)} forecasts")
        print(f"   Insufficient data items: {len(data.get('insufficient_data_items', []))}")
        print(f"   Failed items: {len(data.get('failed_items', []))}")
        
        return True
        
    except Exception as e:
        print(f"❌ Batch forecast endpoint failed: {e}")
        return False

def test_metrics_endpoints():
    """Test metrics endpoints"""
    print("\n📈 Testing metrics endpoints...")
    
    try:
        # Test performance metrics
        response = requests.get(f"{BASE_URL}/metrics/performance", timeout=5)
        assert response.status_code == 200, f"Performance metrics failed: {response.status_code}"
        
        data = response.json()
        assert "status" in data, "Performance metrics missing status"
        assert "data" in data, "Performance metrics missing data"
        
        print("✅ Performance metrics endpoint working")
        
        # Test model metrics
        response = requests.get(f"{BASE_URL}/metrics/models", timeout=5)
        assert response.status_code == 200, f"Model metrics failed: {response.status_code}"
        
        data = response.json()
        assert "status" in data, "Model metrics missing status"
        assert "data" in data, "Model metrics missing data"
        
        print("✅ Model metrics endpoint working")
        
        # Test configuration endpoint
        response = requests.get(f"{BASE_URL}/config", timeout=5)
        assert response.status_code == 200, f"Config endpoint failed: {response.status_code}"
        
        data = response.json()
        assert "status" in data, "Config missing status"
        assert "configuration" in data, "Config missing configuration"
        
        print("✅ Configuration endpoint working")
        
        return True
        
    except Exception as e:
        print(f"❌ Metrics endpoints failed: {e}")
        return False

def test_insufficient_data_handling():
    """Test insufficient data notification system"""
    print("\n⚠️  Testing insufficient data handling...")
    
    # Create insufficient data (less than 14 points)
    sales_data = []
    base_date = datetime.now() - timedelta(days=5)
    
    for i in range(5):  # Only 5 data points
        date_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
        sales_data.append({
            "date": date_str,
            "quantity_sold": 5
        })
    
    forecast_request = {
        "user_id": "test-user-001",
        "sku": "INSUFFICIENT-DATA-TEST",
        "sales_history": sales_data,
        "current_stock": 50,
        "lead_time_days": 7
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/forecast", 
            json=forecast_request,
            timeout=TEST_TIMEOUT
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Should fail due to insufficient data
        assert "success" in data, "Response missing 'success' field"
        assert data["success"] == False, "Should fail with insufficient data"
        assert "insufficient_data" in data, "Response missing 'insufficient_data' field"
        assert data["insufficient_data"] == True, "Should indicate insufficient data"
        assert "minimum_data_points_required" in data, "Missing minimum data points info"
        assert data["minimum_data_points_required"] == 14, "Should require 14 data points"
        
        print("✅ Insufficient data handling working correctly")
        print(f"   Error message: {data.get('error_message', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Insufficient data handling failed: {e}")
        return False

def main():
    """Run all API endpoint tests"""
    print("🧪 Starting comprehensive API endpoint testing...")
    print("=" * 60)
    
    # Start server
    server_process = start_server()
    if not server_process:
        print("❌ Failed to start server, cannot run tests")
        return False
    
    try:
        # Wait a bit more for server to fully initialize
        time.sleep(3)
        
        # Run all tests
        tests = [
            ("Health Check", test_health_endpoint),
            ("Single Forecast", test_forecast_endpoint),
            ("Batch Forecast", test_batch_forecast_endpoint),
            ("Metrics Endpoints", test_metrics_endpoints),
            ("Insufficient Data Handling", test_insufficient_data_handling),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            print(f"\n{'='*60}")
            print(f"Running: {test_name}")
            print(f"{'='*60}")
            
            try:
                if test_func():
                    passed += 1
                    print(f"✅ {test_name} PASSED")
                else:
                    failed += 1
                    print(f"❌ {test_name} FAILED")
            except Exception as e:
                failed += 1
                print(f"❌ {test_name} FAILED with exception: {e}")
        
        # Summary
        print(f"\n{'='*60}")
        print(f"API ENDPOINT TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Total tests: {len(tests)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        
        if failed == 0:
            print("🎉 ALL API ENDPOINTS WORKING CORRECTLY!")
            print("\nThe forecasting service is fully operational with:")
            print("✅ Health monitoring")
            print("✅ Single item forecasting")
            print("✅ Batch forecasting")
            print("✅ Performance metrics")
            print("✅ Data validation and error handling")
            return True
        else:
            print(f"❌ {failed} endpoint tests failed")
            return False
    
    finally:
        # Clean up server process
        if server_process:
            print("\n🛑 Stopping server...")
            server_process.terminate()
            server_process.wait()
            print("✅ Server stopped")

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)