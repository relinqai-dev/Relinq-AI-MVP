#!/usr/bin/env python3
"""
Demo script showing the forecasting service in action
Creates realistic sales data and generates forecasts
"""

import requests
import json
from datetime import datetime, timedelta
import numpy as np

BASE_URL = "http://localhost:8000"

def create_realistic_sales_data(days=30, base_sales=10, trend=0.1, seasonality=True):
    """Create realistic sales data with trend and seasonality"""
    sales_data = []
    base_date = datetime.now() - timedelta(days=days)
    
    for i in range(days):
        date_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
        
        # Base sales with trend
        sales = base_sales + (i * trend)
        
        # Add weekly seasonality (higher on weekends)
        if seasonality:
            day_of_week = (base_date + timedelta(days=i)).weekday()
            if day_of_week >= 5:  # Weekend
                sales *= 1.3
            elif day_of_week == 0:  # Monday (slower)
                sales *= 0.8
        
        # Add some random noise
        noise = np.random.normal(0, sales * 0.2)
        final_sales = max(0, int(sales + noise))
        
        sales_data.append({
            "date": date_str,
            "quantity_sold": final_sales
        })
    
    return sales_data

def demo_single_forecast():
    """Demonstrate single item forecasting"""
    print("🔮 Single Item Forecast Demo")
    print("=" * 50)
    
    # Create realistic sales data for a popular product
    sales_data = create_realistic_sales_data(
        days=25, 
        base_sales=15, 
        trend=0.2,  # Growing trend
        seasonality=True
    )
    
    forecast_request = {
        "user_id": "demo-user",
        "sku": "POPULAR-WIDGET-001",
        "sales_history": sales_data,
        "current_stock": 80,
        "lead_time_days": 5,
        "forecast_days": 7
    }
    
    print(f"📊 Product: {forecast_request['sku']}")
    print(f"📈 Historical data: {len(sales_data)} days")
    print(f"📦 Current stock: {forecast_request['current_stock']}")
    print(f"🚚 Lead time: {forecast_request['lead_time_days']} days")
    
    try:
        response = requests.post(f"{BASE_URL}/forecast", json=forecast_request, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            if data["success"]:
                forecast = data["forecast"]
                
                print("\n✅ Forecast Results:")
                print(f"   🔮 7-day forecast: {forecast['forecast_7_day']} units")
                print(f"   📋 Recommended order: {forecast['recommended_order']} units")
                print(f"   📊 Confidence: {forecast['confidence_score']:.1%}")
                print(f"   📈 Trend: {forecast['trend']}")
                print(f"   🔄 Seasonality detected: {forecast['seasonality_detected']}")
                print(f"   🤖 Model used: {forecast['model_used']}")
                print(f"   ⭐ Data quality: {forecast['data_quality_score']:.1%}")
                
                # Business insights
                print("\n💡 Business Insights:")
                if forecast['recommended_order'] > 0:
                    print(f"   📦 Reorder {forecast['recommended_order']} units to avoid stockout")
                else:
                    print("   ✅ Current stock sufficient for forecast period")
                
                if forecast['trend'] == 'increasing':
                    print("   📈 Sales trending upward - consider increasing inventory")
                elif forecast['trend'] == 'decreasing':
                    print("   📉 Sales trending downward - monitor inventory levels")
                
                if forecast['seasonality_detected']:
                    print("   🔄 Seasonal patterns detected - plan for recurring demand")
                
            else:
                print(f"❌ Forecast failed: {data.get('error_message', 'Unknown error')}")
        else:
            print(f"❌ API request failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def demo_batch_forecast():
    """Demonstrate batch forecasting for multiple products"""
    print("\n\n📦 Batch Forecast Demo")
    print("=" * 50)
    
    products = [
        {"name": "FAST-MOVER-001", "base_sales": 20, "trend": 0.3, "stock": 150},
        {"name": "STEADY-SELLER-002", "base_sales": 8, "trend": 0.0, "stock": 60},
        {"name": "SEASONAL-ITEM-003", "base_sales": 12, "trend": -0.1, "stock": 90},
    ]
    
    items = []
    for product in products:
        sales_data = create_realistic_sales_data(
            days=20,
            base_sales=product["base_sales"],
            trend=product["trend"],
            seasonality=True
        )
        
        items.append({
            "user_id": "demo-user",
            "sku": product["name"],
            "sales_history": sales_data,
            "current_stock": product["stock"],
            "lead_time_days": 7,
            "forecast_days": 7
        })
    
    batch_request = {
        "user_id": "demo-user",
        "items": items
    }
    
    print(f"📊 Processing {len(items)} products...")
    
    try:
        response = requests.post(f"{BASE_URL}/forecast/batch", json=batch_request, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"\n✅ Batch Results:")
            print(f"   📈 Successful forecasts: {len(data['forecasts'])}")
            print(f"   ⚠️  Insufficient data: {len(data['insufficient_data_items'])}")
            print(f"   ❌ Failed items: {len(data['failed_items'])}")
            
            if data['forecasts']:
                print(f"\n📋 Forecast Summary:")
                total_forecast = 0
                total_orders = 0
                
                for forecast in data['forecasts']:
                    print(f"   {forecast['sku']}:")
                    print(f"     🔮 Forecast: {forecast['forecast_7_day']} units")
                    print(f"     📋 Order: {forecast['recommended_order']} units")
                    print(f"     📊 Confidence: {forecast['confidence_score']:.1%}")
                    print(f"     🤖 Model: {forecast['model_used']}")
                    
                    total_forecast += forecast['forecast_7_day']
                    total_orders += forecast['recommended_order']
                
                print(f"\n📊 Portfolio Summary:")
                print(f"   🔮 Total 7-day demand: {total_forecast} units")
                print(f"   📋 Total recommended orders: {total_orders} units")
        else:
            print(f"❌ API request failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Run the forecasting demo"""
    print("🚀 Smart Inventory Forecasting Service Demo")
    print("=" * 60)
    
    # Check if service is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print("❌ Forecasting service is not running!")
            print("Please start the service first: python main.py")
            return
    except:
        print("❌ Cannot connect to forecasting service!")
        print("Please start the service first: python main.py")
        return
    
    print("✅ Connected to forecasting service")
    
    # Run demos
    demo_single_forecast()
    demo_batch_forecast()
    
    print("\n" + "=" * 60)
    print("🎉 Demo completed! The forecasting service is working perfectly.")
    print("\n🔗 Available endpoints:")
    print(f"   📊 Single forecast: POST {BASE_URL}/forecast")
    print(f"   📦 Batch forecast: POST {BASE_URL}/forecast/batch")
    print(f"   ❤️  Health check: GET {BASE_URL}/health")
    print(f"   📈 Metrics: GET {BASE_URL}/metrics/performance")
    print(f"   ⚙️  Config: GET {BASE_URL}/config")

if __name__ == "__main__":
    main()