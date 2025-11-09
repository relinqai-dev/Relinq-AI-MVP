import pandas as pd
import numpy as np
from typing import Tuple, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
from sklearn.metrics import mean_absolute_error, mean_squared_error
import warnings

# Statistical modeling imports
logger = logging.getLogger(__name__)

try:
    from statsmodels.tsa.arima.model import ARIMA
    from statsmodels.tsa.seasonal import seasonal_decompose
    from statsmodels.tsa.stattools import adfuller, acf, pacf
    from statsmodels.stats.diagnostic import acorr_ljungbox
    STATSMODELS_AVAILABLE = True
except ImportError:
    STATSMODELS_AVAILABLE = False
    logger.warning("Statsmodels not available, using simplified ARIMA implementation")

try:
    from pmdarima import auto_arima
    PMDARIMA_AVAILABLE = True
except ImportError:
    PMDARIMA_AVAILABLE = False
    logger.warning("pmdarima not available, using manual ARIMA parameter selection")

# Suppress warnings
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=UserWarning)

logger = logging.getLogger(__name__)

class ForecastResult:
    """Container for forecast results"""
    def __init__(self, predictions: np.ndarray, confidence_intervals: Optional[np.ndarray] = None, 
                 model_name: str = "", trend: str = "stable", seasonality_detected: bool = False,
                 confidence_score: float = 0.0, data_quality_score: float = 0.0, 
                 model_params: Optional[Dict] = None, residual_diagnostics: Optional[Dict] = None):
        self.predictions = predictions
        self.confidence_intervals = confidence_intervals
        self.model_name = model_name
        self.trend = trend
        self.seasonality_detected = seasonality_detected
        self.confidence_score = confidence_score
        self.data_quality_score = data_quality_score
        self.model_params = model_params or {}
        self.residual_diagnostics = residual_diagnostics or {}

class ARIMAForecaster:
    """
    Advanced ARIMA time-series forecasting model for 7-day predictions - Requirement 3.1, 3.2
    Uses statsmodels for proper ARIMA implementation with automatic parameter selection
    """
    
    def __init__(self):
        self.model = None
        self.fitted_model = None
        self.model_params = None
        self.fitted = False
    
    def fit_and_forecast(self, df: pd.DataFrame, forecast_days: int = 7) -> ForecastResult:
        """
        Fit ARIMA model and generate forecasts using proper statistical methods
        
        Args:
            df: DataFrame with 'date' and 'quantity' columns
            forecast_days: Number of days to forecast
            
        Returns:
            ForecastResult with predictions and metadata
        """
        try:
            # Prepare time series
            ts = df.set_index('date')['quantity'].asfreq('D', fill_value=0)
            
            if STATSMODELS_AVAILABLE and len(ts) >= 10:
                return self._fit_statsmodels_arima(ts, forecast_days)
            else:
                return self._fit_simple_arima(ts, forecast_days)
                
        except Exception as e:
            logger.error(f"ARIMA forecasting failed: {str(e)}")
            return self._fallback_forecast(df, forecast_days)
    
    def _fit_statsmodels_arima(self, ts: pd.Series, forecast_days: int) -> ForecastResult:
        """
        Fit proper ARIMA model using statsmodels with automatic parameter selection
        """
        try:
            # Check stationarity
            stationarity_result = self._check_stationarity(ts)
            
            # Seasonal decomposition if enough data
            seasonality_detected = False
            if len(ts) >= 14:
                seasonality_detected = self._detect_advanced_seasonality(ts)
            
            if PMDARIMA_AVAILABLE:
                # Use auto_arima for automatic parameter selection
                logger.info("Fitting ARIMA model with automatic parameter selection...")
                
                # Configure auto_arima parameters
                auto_model = auto_arima(
                    ts,
                    start_p=0, start_q=0, max_p=3, max_q=3,
                    seasonal=seasonality_detected,
                    start_P=0, start_Q=0, max_P=2, max_Q=2, m=7 if seasonality_detected else 1,
                    stepwise=True,
                    suppress_warnings=True,
                    error_action='ignore',
                    trace=False,
                    random_state=42,
                    n_fits=10
                )
            else:
                # Use manual ARIMA with fixed parameters
                logger.info("Using manual ARIMA with fixed parameters...")
                from statsmodels.tsa.arima.model import ARIMA
                auto_model = ARIMA(ts, order=(1, 1, 1)).fit()
            
            self.fitted_model = auto_model
            if PMDARIMA_AVAILABLE:
                self.model_params = {
                    'order': auto_model.order,
                    'seasonal_order': auto_model.seasonal_order,
                    'aic': auto_model.aic(),
                    'bic': auto_model.bic()
                }
            else:
                self.model_params = {
                    'order': (1, 1, 1),
                    'seasonal_order': None,
                    'aic': auto_model.aic,
                    'bic': auto_model.bic
                }
            
            # Generate forecasts with confidence intervals
            if PMDARIMA_AVAILABLE:
                forecast_result = auto_model.predict(n_periods=forecast_days, return_conf_int=True)
                predictions = np.maximum(forecast_result[0], 0)  # Ensure non-negative
                confidence_intervals = forecast_result[1]
            else:
                # Manual ARIMA forecast
                forecast_result = auto_model.forecast(steps=forecast_days)
                predictions = np.maximum(forecast_result, 0)
                confidence_intervals = None
            
            # Calculate trend
            trend = self._calculate_advanced_trend(ts, predictions)
            
            # Calculate confidence score based on model diagnostics
            confidence_score = self._calculate_model_confidence(auto_model, ts)
            
            # Residual diagnostics
            residual_diagnostics = self._calculate_residual_diagnostics(auto_model)
            
            model_name = f"ARIMA{auto_model.order}" if PMDARIMA_AVAILABLE else "ARIMA(1,1,1)"
            
            return ForecastResult(
                predictions=predictions,
                confidence_intervals=confidence_intervals,
                model_name=model_name,
                trend=trend,
                seasonality_detected=seasonality_detected,
                confidence_score=confidence_score,
                model_params=self.model_params,
                residual_diagnostics=residual_diagnostics
            )
            
        except Exception as e:
            logger.warning(f"Advanced ARIMA failed, falling back to simple implementation: {str(e)}")
            return self._fit_simple_arima(ts, forecast_days)
    
    def _check_stationarity(self, ts: pd.Series) -> Dict:
        """
        Check time series stationarity using Augmented Dickey-Fuller test
        """
        try:
            result = adfuller(ts.dropna())
            return {
                'adf_statistic': result[0],
                'p_value': result[1],
                'critical_values': result[4],
                'is_stationary': result[1] < 0.05
            }
        except:
            return {'is_stationary': False}
    
    def _detect_advanced_seasonality(self, ts: pd.Series) -> bool:
        """
        Advanced seasonality detection using statistical methods
        """
        try:
            if len(ts) < 14:
                return False
            
            # Try seasonal decomposition
            decomposition = seasonal_decompose(ts, model='additive', period=7, extrapolate_trend='freq')
            
            # Check if seasonal component has significant variance
            seasonal_var = np.var(decomposition.seasonal.dropna())
            total_var = np.var(ts.dropna())
            
            # Consider seasonal if seasonal variance is > 10% of total variance
            return seasonal_var > 0.1 * total_var
            
        except:
            return self._detect_simple_seasonality(ts)
    
    def _calculate_advanced_trend(self, ts: pd.Series, predictions: np.ndarray) -> str:
        """
        Calculate trend using linear regression on recent data
        """
        try:
            # Use last 7 days for trend calculation
            recent_data = ts.tail(7).values
            if len(recent_data) < 3:
                return "stable"
            
            # Linear regression
            x = np.arange(len(recent_data))
            slope = np.polyfit(x, recent_data, 1)[0]
            
            # Also consider forecast trend
            forecast_slope = np.polyfit(np.arange(len(predictions)), predictions, 1)[0]
            
            # Combine both trends
            combined_slope = (slope + forecast_slope) / 2
            
            if combined_slope > 0.1:
                return "increasing"
            elif combined_slope < -0.1:
                return "decreasing"
            else:
                return "stable"
                
        except:
            return "stable"
    
    def _calculate_model_confidence(self, model, ts: pd.Series) -> float:
        """
        Calculate confidence score based on model diagnostics
        """
        try:
            # Start with base confidence
            confidence = 0.5
            
            # AIC-based confidence (lower AIC = higher confidence)
            aic = model.aic()
            if aic < len(ts) * 2:  # Good AIC relative to data size
                confidence += 0.2
            
            # Residual analysis
            residuals = model.resid()
            if len(residuals) > 0:
                # Check residual normality (Jarque-Bera test would be ideal)
                residual_std = np.std(residuals)
                mean_value = np.mean(ts)
                if mean_value > 0:
                    cv_residuals = residual_std / mean_value
                    if cv_residuals < 0.5:  # Low coefficient of variation
                        confidence += 0.2
            
            # In-sample accuracy
            fitted_values = model.fittedvalues()
            if len(fitted_values) > 0:
                mae = mean_absolute_error(ts[-len(fitted_values):], fitted_values)
                mean_actual = np.mean(ts)
                if mean_actual > 0:
                    mape = mae / mean_actual
                    if mape < 0.2:  # MAPE < 20%
                        confidence += 0.2
            
            return min(0.95, max(0.1, confidence))
            
        except:
            return 0.5
    
    def _calculate_residual_diagnostics(self, model) -> Dict:
        """
        Calculate residual diagnostics for model validation
        """
        try:
            residuals = model.resid()
            
            diagnostics = {
                'residual_mean': np.mean(residuals),
                'residual_std': np.std(residuals),
                'residual_skewness': float(pd.Series(residuals).skew()),
                'residual_kurtosis': float(pd.Series(residuals).kurtosis())
            }
            
            # Ljung-Box test for residual autocorrelation
            try:
                lb_test = acorr_ljungbox(residuals, lags=min(10, len(residuals)//4), return_df=True)
                diagnostics['ljung_box_pvalue'] = float(lb_test['lb_pvalue'].iloc[-1])
            except:
                diagnostics['ljung_box_pvalue'] = None
            
            return diagnostics
            
        except:
            return {}
    
    def _fit_simple_arima(self, ts: pd.Series, forecast_days: int) -> ForecastResult:
        """
        Fallback simple ARIMA implementation
        """
    
    def _calculate_trend(self, ts: pd.Series) -> str:
        """Calculate overall trend direction"""
        if len(ts) < 7:
            return "stable"
        
        # Compare first and last week averages
        first_week = ts.head(7).mean()
        last_week = ts.tail(7).mean()
        
        if last_week > first_week * 1.1:
            return "increasing"
        elif last_week < first_week * 0.9:
            return "decreasing"
        else:
            return "stable"
    
    def _detect_seasonality(self, ts: pd.Series) -> bool:
        """Simple seasonality detection"""
        if len(ts) < 14:
            return False
        
        # Check for weekly patterns (7-day cycle)
        try:
            weekly_pattern = []
            for day in range(7):
                day_values = ts[ts.index.dayofweek == day]
                if len(day_values) > 1:
                    weekly_pattern.append(day_values.mean())
            
            if len(weekly_pattern) == 7:
                # Check if there's significant variation across days
                cv = np.std(weekly_pattern) / np.mean(weekly_pattern) if np.mean(weekly_pattern) > 0 else 0
                return cv > 0.3
        except:
            pass
        
        return False
    
    def _exponential_smoothing_forecast(self, ts: pd.Series, forecast_days: int) -> np.ndarray:
        """
        Simple exponential smoothing forecast
        """
        if len(ts) == 0:
            return np.zeros(forecast_days)
        
        # Parameters
        alpha = 0.3  # Smoothing parameter
        
        # Initialize
        smoothed = [ts.iloc[0]]
        
        # Calculate smoothed values
        for i in range(1, len(ts)):
            smoothed.append(alpha * ts.iloc[i] + (1 - alpha) * smoothed[-1])
        
        # Forecast
        last_smoothed = smoothed[-1]
        
        # Add trend component
        if len(ts) >= 7:
            recent_trend = (ts.tail(7).mean() - ts.head(7).mean()) / len(ts)
            forecasts = []
            for i in range(forecast_days):
                forecast_value = last_smoothed + recent_trend * (i + 1)
                forecasts.append(max(0, forecast_value))  # Ensure non-negative
        else:
            forecasts = [max(0, last_smoothed)] * forecast_days
        
        return np.array(forecasts)
    
    def _calculate_confidence_score(self, ts: pd.Series, predictions: np.ndarray) -> float:
        """Calculate confidence score based on historical accuracy"""
        if len(ts) < 7 or len(predictions) == 0:
            return 0.5
        
        # Use last week for validation
        actual = ts.tail(7).values
        if len(actual) < 7:
            return 0.5
        
        # Simple accuracy measure
        try:
            mae = mean_absolute_error(actual, predictions[-7:] if len(predictions) >= 7 else predictions)
            mean_actual = np.mean(actual)
            
            if mean_actual > 0:
                accuracy = 1 - (mae / mean_actual)
                return max(0.1, min(0.9, accuracy))
        except:
            pass
        
        return 0.5
    
    def _fallback_forecast(self, df: pd.DataFrame, forecast_days: int) -> ForecastResult:
        """Fallback to simple moving average"""
        recent_avg = df.tail(7)['quantity'].mean() if len(df) >= 7 else df['quantity'].mean()
        predictions = np.full(forecast_days, max(0, recent_avg))
        
        return ForecastResult(
            predictions=predictions,
            model_name="Moving-Average-Fallback",
            trend="stable",
            seasonality_detected=False,
            confidence_score=0.3
        )

class ProphetForecaster:
    """
    Prophet model for seasonal trend and velocity pattern analysis - Requirement 3.3
    """
    
    def __init__(self):
        self.model = None
    
    def fit_and_forecast(self, df: pd.DataFrame, forecast_days: int = 7) -> ForecastResult:
        """
        Fit Prophet model and generate forecasts
        """
        try:
            from prophet import Prophet
            
            # Prepare data for Prophet
            prophet_df = df.copy()
            prophet_df.columns = ['ds', 'y']  # Prophet requires these column names
            prophet_df['ds'] = pd.to_datetime(prophet_df['ds'])
            
            # Initialize Prophet model
            model = Prophet(
                daily_seasonality=True,
                weekly_seasonality=True,
                yearly_seasonality=False,  # Not enough data typically
                changepoint_prior_scale=0.05,  # Conservative changepoint detection
                seasonality_prior_scale=10.0,
                interval_width=0.8
            )
            
            # Fit model
            model.fit(prophet_df)
            
            # Create future dataframe
            future = model.make_future_dataframe(periods=forecast_days)
            
            # Generate forecast
            forecast = model.predict(future)
            
            # Extract predictions for forecast period
            predictions = forecast.tail(forecast_days)['yhat'].values
            predictions = np.maximum(predictions, 0)  # Ensure non-negative
            
            # Analyze trend and seasonality
            trend = self._analyze_prophet_trend(forecast)
            seasonality_detected = self._analyze_prophet_seasonality(model, prophet_df)
            
            # Calculate confidence score
            confidence_score = self._calculate_prophet_confidence(model, prophet_df, forecast)
            
            return ForecastResult(
                predictions=predictions,
                confidence_intervals=forecast.tail(forecast_days)[['yhat_lower', 'yhat_upper']].values,
                model_name="Prophet",
                trend=trend,
                seasonality_detected=seasonality_detected,
                confidence_score=confidence_score
            )
            
        except ImportError:
            logger.warning("Prophet not available, falling back to ARIMA")
            arima_forecaster = ARIMAForecaster()
            result = arima_forecaster.fit_and_forecast(df, forecast_days)
            result.model_name = "ARIMA-Fallback"
            return result
        except Exception as e:
            logger.error(f"Prophet forecasting failed: {str(e)}")
            # Fallback to ARIMA
            arima_forecaster = ARIMAForecaster()
            result = arima_forecaster.fit_and_forecast(df, forecast_days)
            result.model_name = "ARIMA-Fallback"
            return result
    
    def _analyze_prophet_trend(self, forecast: pd.DataFrame) -> str:
        """Analyze trend from Prophet forecast"""
        trend_values = forecast['trend'].values
        if len(trend_values) < 2:
            return "stable"
        
        start_trend = np.mean(trend_values[:7]) if len(trend_values) >= 7 else trend_values[0]
        end_trend = np.mean(trend_values[-7:]) if len(trend_values) >= 7 else trend_values[-1]
        
        change_ratio = (end_trend - start_trend) / start_trend if start_trend > 0 else 0
        
        if change_ratio > 0.1:
            return "increasing"
        elif change_ratio < -0.1:
            return "decreasing"
        else:
            return "stable"
    
    def _analyze_prophet_seasonality(self, model, df: pd.DataFrame) -> bool:
        """Check if Prophet detected significant seasonality"""
        try:
            # Check if weekly seasonality component is significant
            if hasattr(model, 'seasonalities') and 'weekly' in model.seasonalities:
                # Simple check: if we have enough data and weekly seasonality was enabled
                return len(df) >= 14
        except:
            pass
        return False
    
    def _calculate_prophet_confidence(self, model, df: pd.DataFrame, forecast: pd.DataFrame) -> float:
        """Calculate confidence score for Prophet model"""
        try:
            # Use cross-validation approach on last few points
            if len(df) < 14:
                return 0.5
            
            # Simple validation: compare last week actual vs predicted
            train_df = df.iloc[:-7]
            test_df = df.iloc[-7:]
            
            if len(train_df) < 7:
                return 0.5
            
            # Fit on training data
            temp_model = Prophet(daily_seasonality=True, weekly_seasonality=True, yearly_seasonality=False)
            temp_model.fit(train_df)
            
            # Predict test period
            future = temp_model.make_future_dataframe(periods=7)
            test_forecast = temp_model.predict(future)
            
            # Calculate accuracy
            actual = test_df['y'].values
            predicted = test_forecast.tail(7)['yhat'].values
            
            mae = mean_absolute_error(actual, predicted)
            mean_actual = np.mean(actual)
            
            if mean_actual > 0:
                accuracy = 1 - (mae / mean_actual)
                return max(0.1, min(0.9, accuracy))
        except:
            pass
        
        return 0.5   
     # Calculate trend
        trend = self._calculate_trend(ts)
        
        # Detect seasonality
        seasonality_detected = self._detect_simple_seasonality(ts)
        
        # Generate forecasts using exponential smoothing approach
        predictions = self._exponential_smoothing_forecast(ts, forecast_days)
        
        # Calculate confidence score based on historical accuracy
        confidence_score = self._calculate_confidence_score(ts, predictions[:len(ts)])
        
        return ForecastResult(
            predictions=predictions,
            model_name="ARIMA-Simple",
            trend=trend,
            seasonality_detected=seasonality_detected,
            confidence_score=confidence_score
        )
    
    def _calculate_trend(self, ts: pd.Series) -> str:
        """Calculate overall trend direction"""
        if len(ts) < 7:
            return "stable"
        
        # Compare first and last week averages
        first_week = ts.head(7).mean()
        last_week = ts.tail(7).mean()
        
        if last_week > first_week * 1.1:
            return "increasing"
        elif last_week < first_week * 0.9:
            return "decreasing"
        else:
            return "stable"
    
    def _detect_simple_seasonality(self, ts: pd.Series) -> bool:
        """Simple seasonality detection"""
        if len(ts) < 14:
            return False
        
        # Check for weekly patterns (7-day cycle)
        try:
            weekly_pattern = []
            for day in range(7):
                day_values = ts[ts.index.dayofweek == day]
                if len(day_values) > 1:
                    weekly_pattern.append(day_values.mean())
            
            if len(weekly_pattern) == 7:
                # Check if there's significant variation across days
                cv = np.std(weekly_pattern) / np.mean(weekly_pattern) if np.mean(weekly_pattern) > 0 else 0
                return cv > 0.3
        except:
            pass
        
        return False
    
    def _exponential_smoothing_forecast(self, ts: pd.Series, forecast_days: int) -> np.ndarray:
        """
        Simple exponential smoothing forecast
        """
        if len(ts) == 0:
            return np.zeros(forecast_days)
        
        # Parameters
        alpha = 0.3  # Smoothing parameter
        
        # Initialize
        smoothed = [ts.iloc[0]]
        
        # Calculate smoothed values
        for i in range(1, len(ts)):
            smoothed.append(alpha * ts.iloc[i] + (1 - alpha) * smoothed[-1])
        
        # Forecast
        last_smoothed = smoothed[-1]
        
        # Add trend component
        if len(ts) >= 7:
            recent_trend = (ts.tail(7).mean() - ts.head(7).mean()) / len(ts)
            forecasts = []
            for i in range(forecast_days):
                forecast_value = last_smoothed + recent_trend * (i + 1)
                forecasts.append(max(0, forecast_value))  # Ensure non-negative
        else:
            forecasts = [max(0, last_smoothed)] * forecast_days
        
        return np.array(forecasts)
    
    def _calculate_confidence_score(self, ts: pd.Series, predictions: np.ndarray) -> float:
        """Calculate confidence score based on historical accuracy"""
        if len(ts) < 7 or len(predictions) == 0:
            return 0.5
        
        # Use last week for validation
        actual = ts.tail(7).values
        if len(actual) < 7:
            return 0.5
        
        # Simple accuracy measure
        try:
            mae = mean_absolute_error(actual, predictions[-7:] if len(predictions) >= 7 else predictions)
            mean_actual = np.mean(actual)
            
            if mean_actual > 0:
                accuracy = 1 - (mae / mean_actual)
                return max(0.1, min(0.9, accuracy))
        except:
            pass
        
        return 0.5
    
    def _fallback_forecast(self, df: pd.DataFrame, forecast_days: int) -> ForecastResult:
        """Fallback to simple moving average"""
        recent_avg = df.tail(7)['quantity'].mean() if len(df) >= 7 else df['quantity'].mean()
        predictions = np.full(forecast_days, max(0, recent_avg))
        
        return ForecastResult(
            predictions=predictions,
            model_name="Moving-Average-Fallback",
            trend="stable",
            seasonality_detected=False,
            confidence_score=0.3
        )

class ProphetForecaster:
    """
    Advanced Prophet model for seasonal trend and velocity pattern analysis - Requirement 3.3
    Enhanced with custom seasonalities and holiday effects
    """
    
    def __init__(self):
        self.model = None
        self.fitted_model = None
    
    def fit_and_forecast(self, df: pd.DataFrame, forecast_days: int = 7) -> ForecastResult:
        """
        Fit Prophet model and generate forecasts with advanced features
        """
        try:
            from prophet import Prophet
            from prophet.diagnostics import cross_validation, performance_metrics
            
            # Prepare data for Prophet
            prophet_df = df.copy()
            prophet_df.columns = ['ds', 'y']  # Prophet requires these column names
            prophet_df['ds'] = pd.to_datetime(prophet_df['ds'])
            
            # Configure Prophet with advanced settings
            model = Prophet(
                growth='linear',  # Can be 'logistic' for bounded growth
                daily_seasonality=True,
                weekly_seasonality=True,
                yearly_seasonality=False,  # Usually not enough data
                changepoint_prior_scale=0.05,  # Conservative changepoint detection
                seasonality_prior_scale=10.0,
                holidays_prior_scale=10.0,
                seasonality_mode='additive',  # Can be 'multiplicative'
                interval_width=0.8,
                mcmc_samples=0  # Use MAP estimation for speed
            )
            
            # Add custom seasonalities if enough data
            if len(prophet_df) >= 14:
                # Add custom weekly seasonality with Fourier terms
                model.add_seasonality(
                    name='weekly_custom',
                    period=7,
                    fourier_order=3,
                    prior_scale=10.0
                )
            
            # Add business day effects if enough data
            if len(prophet_df) >= 21:
                prophet_df['is_weekend'] = prophet_df['ds'].dt.dayofweek.isin([5, 6]).astype(int)
                model.add_regressor('is_weekend')
            
            # Fit model
            logger.info("Fitting Prophet model with advanced seasonalities...")
            model.fit(prophet_df)
            self.fitted_model = model
            
            # Create future dataframe
            future = model.make_future_dataframe(periods=forecast_days)
            
            # Add regressors to future dataframe
            if 'is_weekend' in prophet_df.columns:
                future['is_weekend'] = future['ds'].dt.dayofweek.isin([5, 6]).astype(int)
            
            # Generate forecast
            forecast = model.predict(future)
            
            # Extract predictions for forecast period
            predictions = forecast.tail(forecast_days)['yhat'].values
            predictions = np.maximum(predictions, 0)  # Ensure non-negative
            
            # Extract confidence intervals
            confidence_intervals = forecast.tail(forecast_days)[['yhat_lower', 'yhat_upper']].values
            
            # Analyze trend and seasonality
            trend = self._analyze_prophet_trend(forecast)
            seasonality_detected = self._analyze_prophet_seasonality(model, prophet_df, forecast)
            
            # Calculate confidence score using cross-validation if enough data
            confidence_score = self._calculate_prophet_confidence_advanced(model, prophet_df, forecast_days)
            
            # Extract model components for analysis
            model_params = self._extract_prophet_components(forecast)
            
            return ForecastResult(
                predictions=predictions,
                confidence_intervals=confidence_intervals,
                model_name="Prophet-Advanced",
                trend=trend,
                seasonality_detected=seasonality_detected,
                confidence_score=confidence_score,
                model_params=model_params
            )
            
        except ImportError:
            logger.warning("Prophet not available, falling back to ARIMA")
            arima_forecaster = ARIMAForecaster()
            result = arima_forecaster.fit_and_forecast(df, forecast_days)
            result.model_name = "ARIMA-Fallback"
            return result
        except Exception as e:
            logger.error(f"Prophet forecasting failed: {str(e)}")
            # Fallback to ARIMA
            arima_forecaster = ARIMAForecaster()
            result = arima_forecaster.fit_and_forecast(df, forecast_days)
            result.model_name = "ARIMA-Fallback"
            return result
    
    def _analyze_prophet_trend(self, forecast: pd.DataFrame) -> str:
        """Analyze trend from Prophet forecast components"""
        try:
            trend_values = forecast['trend'].values
            if len(trend_values) < 2:
                return "stable"
            
            # Calculate trend slope using linear regression
            x = np.arange(len(trend_values))
            slope = np.polyfit(x, trend_values, 1)[0]
            
            # Also check recent trend (last 7 days)
            recent_trend = trend_values[-7:] if len(trend_values) >= 7 else trend_values
            recent_slope = np.polyfit(np.arange(len(recent_trend)), recent_trend, 1)[0]
            
            # Combine overall and recent trends
            combined_slope = (slope + recent_slope * 2) / 3  # Weight recent trend more
            
            # Determine trend direction
            if combined_slope > 0.05:
                return "increasing"
            elif combined_slope < -0.05:
                return "decreasing"
            else:
                return "stable"
                
        except:
            return "stable"
    
    def _analyze_prophet_seasonality(self, model, df: pd.DataFrame, forecast: pd.DataFrame) -> bool:
        """Advanced seasonality analysis using Prophet components"""
        try:
            # Check if weekly seasonality component is significant
            if 'weekly' in forecast.columns:
                weekly_component = forecast['weekly'].values
                weekly_range = np.max(weekly_component) - np.min(weekly_component)
                
                # Compare to overall forecast range
                forecast_range = np.max(forecast['yhat']) - np.min(forecast['yhat'])
                
                # Consider seasonal if weekly variation is > 10% of total variation
                if forecast_range > 0 and weekly_range / forecast_range > 0.1:
                    return True
            
            # Check custom seasonalities
            if 'weekly_custom' in forecast.columns:
                custom_component = forecast['weekly_custom'].values
                custom_range = np.max(custom_component) - np.min(custom_component)
                
                if custom_range > 0.1 * np.mean(df['y']):
                    return True
            
            # Fallback to simple detection
            return len(df) >= 14
            
        except:
            return False
    
    def _calculate_prophet_confidence_advanced(self, model, df: pd.DataFrame, forecast_days: int) -> float:
        """
        Advanced confidence calculation using cross-validation and model diagnostics
        """
        try:
            # Base confidence
            confidence = 0.5
            
            # If we have enough data, use cross-validation
            if len(df) >= 21:
                try:
                    from prophet.diagnostics import cross_validation, performance_metrics
                    
                    # Perform cross-validation
                    cv_results = cross_validation(
                        model, 
                        initial='14 days', 
                        period='3 days', 
                        horizon='7 days',
                        disable_tqdm=True
                    )
                    
                    # Calculate performance metrics
                    metrics = performance_metrics(cv_results)
                    
                    # Use MAPE (Mean Absolute Percentage Error) for confidence
                    mape = metrics['mape'].mean()
                    if mape < 0.2:  # MAPE < 20%
                        confidence += 0.3
                    elif mape < 0.4:  # MAPE < 40%
                        confidence += 0.2
                    else:
                        confidence += 0.1
                        
                except Exception as cv_error:
                    logger.warning(f"Cross-validation failed: {cv_error}")
                    # Fallback to simpler validation
                    confidence += self._simple_validation_confidence(model, df)
            else:
                confidence += self._simple_validation_confidence(model, df)
            
            # Model complexity penalty
            if hasattr(model, 'params') and len(model.params) > 20:
                confidence -= 0.1  # Penalize overly complex models
            
            return max(0.1, min(0.95, confidence))
            
        except:
            return 0.5
    
    def _simple_validation_confidence(self, model, df: pd.DataFrame) -> float:
        """Simple validation when cross-validation isn't possible"""
        try:
            if len(df) < 14:
                return 0.1
            
            # Use last 7 days for validation
            train_df = df.iloc[:-7]
            test_df = df.iloc[-7:]
            
            # Fit on training data
            temp_model = Prophet(
                daily_seasonality=True, 
                weekly_seasonality=True, 
                yearly_seasonality=False,
                changepoint_prior_scale=0.05
            )
            temp_model.fit(train_df)
            
            # Predict test period
            future = temp_model.make_future_dataframe(periods=7)
            test_forecast = temp_model.predict(future)
            
            # Calculate accuracy
            actual = test_df['y'].values
            predicted = test_forecast.tail(7)['yhat'].values
            
            mae = mean_absolute_error(actual, predicted)
            mean_actual = np.mean(actual)
            
            if mean_actual > 0:
                mape = mae / mean_actual
                if mape < 0.2:
                    return 0.3
                elif mape < 0.4:
                    return 0.2
                else:
                    return 0.1
                    
        except:
            pass
        
        return 0.1
    
    def _extract_prophet_components(self, forecast: pd.DataFrame) -> Dict:
        """Extract Prophet model components for analysis"""
        try:
            components = {}
            
            # Extract trend statistics
            if 'trend' in forecast.columns:
                trend_values = forecast['trend'].values
                components['trend_mean'] = float(np.mean(trend_values))
                components['trend_std'] = float(np.std(trend_values))
                components['trend_slope'] = float(np.polyfit(np.arange(len(trend_values)), trend_values, 1)[0])
            
            # Extract seasonality statistics
            if 'weekly' in forecast.columns:
                weekly_values = forecast['weekly'].values
                components['weekly_amplitude'] = float(np.max(weekly_values) - np.min(weekly_values))
                components['weekly_mean'] = float(np.mean(weekly_values))
            
            # Extract uncertainty statistics
            if 'yhat_lower' in forecast.columns and 'yhat_upper' in forecast.columns:
                uncertainty = forecast['yhat_upper'] - forecast['yhat_lower']
                components['uncertainty_mean'] = float(np.mean(uncertainty))
                components['uncertainty_std'] = float(np.std(uncertainty))
            
            return components
            
        except:
            return {}