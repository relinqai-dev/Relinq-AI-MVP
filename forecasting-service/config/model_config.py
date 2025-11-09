"""
Configuration settings for forecasting models
"""

# Data validation settings
DATA_VALIDATION = {
    'min_data_points': 14,
    'min_days_span': 14,
    'max_gap_days': 7,
    'outlier_threshold': 0.1,  # 10% outliers considered significant
    'zero_sales_threshold': 0.5,  # 50% zero sales triggers warning
    'data_recency_days': 30,  # Data older than 30 days gets penalty
}

# ARIMA model settings
ARIMA_CONFIG = {
    'max_p': 3,
    'max_q': 3,
    'max_P': 2,
    'max_Q': 2,
    'seasonal_period': 7,  # Weekly seasonality
    'information_criterion': 'aic',
    'stepwise': True,
    'suppress_warnings': True,
    'error_action': 'ignore',
    'random_state': 42,
    'n_fits': 10,
}

# Prophet model settings
PROPHET_CONFIG = {
    'growth': 'linear',
    'daily_seasonality': True,
    'weekly_seasonality': True,
    'yearly_seasonality': False,
    'changepoint_prior_scale': 0.05,
    'seasonality_prior_scale': 10.0,
    'holidays_prior_scale': 10.0,
    'seasonality_mode': 'additive',
    'interval_width': 0.8,
    'mcmc_samples': 0,
    'weekly_fourier_order': 3,
}

# Ensemble settings
ENSEMBLE_CONFIG = {
    'prophet_seasonality_bonus': 1.1,  # Prefer Prophet when seasonality detected
    'arima_simplicity_bonus': 1.1,    # Prefer ARIMA for simple patterns
    'confidence_threshold': 0.1,      # Minimum confidence difference for model selection
    'ensemble_weight_arima': 0.5,     # Weight for ARIMA in ensemble
    'ensemble_weight_prophet': 0.5,   # Weight for Prophet in ensemble
}

# Forecast processing settings
FORECAST_CONFIG = {
    'default_forecast_days': 7,
    'max_forecast_days': 30,
    'safety_stock_ratio': 0.2,        # 20% safety stock
    'min_order_ratio': 0.1,           # Minimum order is 10% of forecast
    'lead_time_multiplier': 1.0,      # Lead time demand multiplier
    'confidence_penalty_threshold': 0.3,  # Apply penalty if confidence < 30%
}

# Performance settings
PERFORMANCE_CONFIG = {
    'max_processing_time_seconds': 30,
    'enable_parallel_processing': True,
    'cache_model_results': False,  # Disable for real-time accuracy
    'log_performance_metrics': True,
}

# API settings
API_CONFIG = {
    'max_batch_size': 100,
    'request_timeout_seconds': 60,
    'enable_detailed_diagnostics': True,
    'return_confidence_intervals': True,
    'include_model_diagnostics': True,
}

# Logging configuration
LOGGING_CONFIG = {
    'level': 'INFO',
    'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    'log_model_performance': True,
    'log_data_quality_issues': True,
    'log_forecast_accuracy': True,
}