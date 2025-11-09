#!/usr/bin/env python3
"""
Quick test to verify the forecasting service is working
"""

import requests
import json
from datetime import datetime, timedelta

def test_health_endpoint():
    """Test health endpoint"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"Health check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_forecast_endpoint():
    """Test forecast endpoint"""
    try:
        # Create test data
        sales_data = []
        base_date = datetime.now() - timedelta(days=20)
        
        for i in range(15):
            date_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
            sales_data.append({
                "date": date_str,
                "quantity_sold": 5 + (i % 3)  # Simple pattern
            })
        
        forecast_request = {
            "user_id": "test-user",
            "sku": "TEST-SKU-001",
            "sales_history": sales_data,
            "current_stock": 100,
            "lead_time_days": 7,
            "forecast_days": 7
        }
        
        response = requests.post(
            "http://localhost:8000/forecast", 
            json=forecast_request,
            timeout=30
        )
        
        print(f"Forecast request: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data['success']}")
            
            if data['success'] and data['forecast']:
                forecast = data['forecast']
                print(f"SKU: {forecast['sku']}")
                print(f"7-day forecast: {forecast['forecast_7_day']}")
                print(f"Recommended order: {forecast['recommended_order']}")
                print(f"Model used: {forecast['model_used']}")
                print(f"Confidence: {forecast['confidence_score']:.3f}")
                print(f"Trend: {forecast['trend']}")
                return True
            else:
                print(f"Forecast failed: {data.get('error_message', 'Unknown error')}")
                return False
        else:
            print(f"Request failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"Forecast test failed: {e}")
        return False

def test_metrics_endpoint():
    """Test metrics endpoint"""
    try:
        response = requests.get("http://localhost:8000/metrics/performance", timeout=5)
        print(f"Metrics request: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Metrics available: {data['status']}")
            return True
        else:
            print(f"Metrics failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"Metrics test failed: {e}")
        return False

def main():
    """Run quick tests"""
    print("🧪 Running quick forecasting service tests...")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_endpoint),
        ("Forecast API", test_forecast_endpoint),
        ("Metrics API", test_metrics_endpoint),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing: {test_name}")
        print("-" * 30)
        
        if test_func():
            print(f"✅ {test_name} PASSED")
            passed += 1
        else:
            print(f"❌ {test_name} FAILED")
    
    print("\n" + "=" * 50)
    print(f"📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Forecasting service is working correctly.")
        return True
    else:
        print("⚠️  Some tests failed. Check the service is running on http://localhost:8000")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)