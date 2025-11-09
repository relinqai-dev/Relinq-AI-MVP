# Smart Inventory Forecasting Engine

A Python microservice that provides AI-powered demand forecasting for retail inventory management using ARIMA and Prophet models.

## Features

- **ARIMA Time-Series Forecasting**: 7-day demand predictions using statistical models (Requirement 3.1, 3.2)
- **Prophet Seasonal Analysis**: Seasonal trend and velocity pattern detection (Requirement 3.3)
- **Lead Time Integration**: Factors supplier lead times into reorder calculations (Requirement 3.4)
- **Data Validation**: Minimum 14 data points requirement checking (Requirement 3.6)
- **Structured Output**: Comprehensive forecast data with confidence scores (Requirement 3.5)
- **Insufficient Data Notifications**: Clear messaging when data requirements aren't met (Requirement 3.6)

## API Endpoints

### Health Check
```
GET /health
```

### Single Item Forecast
```
POST /forecast
```

Request body:
```json
{
  "user_id": "user-123",
  "sku": "PRODUCT-001",
  "sales_history": [
    {"date": "2024-01-01", "quantity_sold": 5},
    {"date": "2024-01-02", "quantity_sold": 3}
  ],
  "current_stock": 100,
  "lead_time_days": 7,
  "forecast_days": 7
}
```

Response:
```json
{
  "forecast": {
    "sku": "PRODUCT-001",
    "current_stock": 100,
    "forecast_7_day": 35,
    "recommended_order": 15,
    "confidence_score": 0.75,
    "trend": "increasing",
    "seasonality_detected": true,
    "lead_time_factored": 7,
    "model_used": "Prophet",
    "data_quality_score": 0.8
  },
  "success": true,
  "insufficient_data": false,
  "data_quality_warnings": []
}
```

### Batch Forecast
```
POST /forecast/batch
```

## Setup Instructions

### Local Development

1. **Install Python 3.11+**
   ```bash
   python --version  # Should be 3.11 or higher
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the service**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

5. **Test the service**
   ```bash
   python test_service.py
   ```

### Docker Deployment

1. **Build the image**
   ```bash
   docker build -t forecasting-service .
   ```

2. **Run the container**
   ```bash
   docker run -p 8000:8000 forecasting-service
   ```

### Google Cloud Run Deployment

1. **Build and push to Google Container Registry**
   ```bash
   gcloud builds submit --tag gcr.io/YOUR-PROJECT-ID/forecasting-service
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy forecasting-service \
     --image gcr.io/YOUR-PROJECT-ID/forecasting-service \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --memory 1Gi \
     --cpu 1
   ```

## Model Details

### ARIMA Forecaster
- Uses exponential smoothing with trend analysis
- Detects weekly seasonality patterns
- Provides fallback when Prophet is unavailable
- Confidence scoring based on historical accuracy

### Prophet Forecaster
- Facebook's Prophet model for time series forecasting
- Handles daily and weekly seasonality
- Robust to missing data and outliers
- Provides confidence intervals

### Ensemble Approach
- Combines ARIMA and Prophet predictions when both are available
- Selects best model based on confidence scores
- Falls back gracefully when models fail

## Data Requirements

- **Minimum Data Points**: 14 historical sales records
- **Minimum Time Span**: 14 days of sales history
- **Data Format**: Daily sales quantities with dates
- **Quality Checks**: Validates data consistency and identifies outliers

## Error Handling

- Graceful fallback to simpler models when advanced models fail
- Clear error messages for insufficient data
- Data quality warnings for irregular patterns
- Comprehensive logging for debugging

## Performance

- Optimized for retail inventory forecasting
- Handles batch processing for multiple SKUs
- Memory-efficient processing
- Fast response times (<2 seconds per forecast)

## Integration

This service is designed to integrate with the main Next.js application through API calls. The main application should:

1. Collect sales data from POS systems
2. Send forecast requests to this service
3. Process recommendations for the dashboard
4. Use forecasts for purchase order generation

## Testing

Run the test suite:
```bash
python test_service.py
```

The tests cover:
- Data validation logic
- ARIMA forecasting accuracy
- Prophet model integration
- API request/response validation
- Error handling scenarios