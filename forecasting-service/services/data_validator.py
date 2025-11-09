from typing import List, NamedTuple, Dict, Any
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import logging
from scipy import stats
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN

logger = logging.getLogger(__name__)

class ValidationResult(NamedTuple):
    is_valid: bool
    insufficient_data: bool
    error_message: str = None
    warnings: List[str] = []
    data_quality_score: float = 0.0

class DataValidator:
    """
    Validates sales data for forecasting requirements
    Implements minimum data requirements checking (14+ data points) - Requirement 3.6
    """
    
    MIN_DATA_POINTS = 14
    MIN_DAYS_SPAN = 14
    
    def validate_sales_data(self, sales_data: List) -> ValidationResult:
        """
        Validate sales data meets minimum requirements for forecasting
        
        Args:
            sales_data: List of sales data points with date and quantity
            
        Returns:
            ValidationResult with validation status and warnings
        """
        warnings = []
        
        # Check if we have any data
        if not sales_data or len(sales_data) == 0:
            return ValidationResult(
                is_valid=False,
                insufficient_data=True,
                error_message="No sales data provided"
            )
        
        # Check minimum data points requirement
        if len(sales_data) < self.MIN_DATA_POINTS:
            return ValidationResult(
                is_valid=False,
                insufficient_data=True,
                error_message=f"Insufficient data points. Need at least {self.MIN_DATA_POINTS} data points, got {len(sales_data)}"
            )
        
        # Convert to DataFrame for analysis
        try:
            df = pd.DataFrame([
                {"date": pd.to_datetime(point.date), "quantity": point.quantity_sold}
                for point in sales_data
            ])
        except Exception as e:
            return ValidationResult(
                is_valid=False,
                insufficient_data=False,
                error_message=f"Invalid date format in sales data: {str(e)}"
            )
        
        # Sort by date
        df = df.sort_values('date')
        
        # Check date span
        date_span = (df['date'].max() - df['date'].min()).days
        if date_span < self.MIN_DAYS_SPAN:
            return ValidationResult(
                is_valid=False,
                insufficient_data=True,
                error_message=f"Data span too short. Need at least {self.MIN_DAYS_SPAN} days of data, got {date_span} days"
            )
        
        # Check for data quality issues
        data_quality_score = self._calculate_data_quality_score(df, warnings)
        
        # Check for recent data (within last 30 days)
        days_since_last_sale = (datetime.now() - df['date'].max()).days
        if days_since_last_sale > 30:
            warnings.append(f"Last sale was {days_since_last_sale} days ago. Forecast may be less accurate.")
        
        # Check for zero sales periods
        zero_sales_count = len(df[df['quantity'] == 0])
        if zero_sales_count > len(df) * 0.5:
            warnings.append("More than 50% of data points have zero sales. This may affect forecast accuracy.")
        
        # Check for outliers
        if self._has_significant_outliers(df):
            warnings.append("Significant outliers detected in sales data. Consider reviewing for data entry errors.")
        
        return ValidationResult(
            is_valid=True,
            insufficient_data=False,
            warnings=warnings,
            data_quality_score=data_quality_score
        )
    
    def _calculate_data_quality_score(self, df: pd.DataFrame, warnings: List[str]) -> float:
        """
        Advanced data quality score calculation using multiple statistical measures
        """
        score = 1.0
        
        # 1. Data completeness and frequency analysis
        df['date_diff'] = df['date'].diff().dt.days
        avg_gap = df['date_diff'].mean()
        gap_std = df['date_diff'].std()
        
        if avg_gap > 2:  # More than 2 days average gap
            score -= 0.15
            warnings.append("Irregular data frequency detected. Daily data recommended for best accuracy.")
        
        if gap_std > 3:  # High variability in gaps
            score -= 0.1
            warnings.append("Inconsistent data collection intervals detected.")
        
        # 2. Statistical distribution analysis
        quantities = df['quantity'].values
        
        # Coefficient of variation
        cv = np.std(quantities) / np.mean(quantities) if np.mean(quantities) > 0 else 0
        if cv > 2:  # High coefficient of variation
            score -= 0.15
            warnings.append("High sales variability detected. Forecast confidence may be lower.")
        elif cv > 1:
            score -= 0.05
        
        # 3. Zero sales analysis
        zero_ratio = len(df[df['quantity'] == 0]) / len(df)
        if zero_ratio > 0.5:
            score -= 0.25
            warnings.append("More than 50% zero sales days. Consider product lifecycle stage.")
        elif zero_ratio > 0.3:
            score -= 0.15
        
        # 4. Trend consistency
        trend_score = self._analyze_trend_consistency(quantities)
        score += trend_score * 0.1  # Bonus for consistent trends
        
        # 5. Seasonality strength
        seasonality_score = self._analyze_seasonality_strength(df)
        score += seasonality_score * 0.1  # Bonus for clear seasonality
        
        # 6. Outlier impact assessment
        outlier_impact = self._assess_outlier_impact(quantities)
        score -= outlier_impact * 0.2
        
        # 7. Data recency bonus
        days_since_last = (datetime.now() - df['date'].max()).days
        if days_since_last <= 7:
            score += 0.05  # Recent data bonus
        elif days_since_last > 30:
            score -= 0.1
            warnings.append(f"Data is {days_since_last} days old. Recent data improves accuracy.")
        
        # Ensure score is between 0 and 1
        return max(0.0, min(1.0, score))
    
    def _analyze_trend_consistency(self, quantities: np.ndarray) -> float:
        """
        Analyze trend consistency using moving averages
        """
        try:
            if len(quantities) < 7:
                return 0.0
            
            # Calculate 3-day moving average
            ma3 = pd.Series(quantities).rolling(window=3).mean().dropna()
            
            # Calculate trend changes
            trend_changes = np.diff(np.sign(np.diff(ma3)))
            trend_consistency = 1.0 - (np.count_nonzero(trend_changes) / len(trend_changes))
            
            return trend_consistency
            
        except:
            return 0.0
    
    def _analyze_seasonality_strength(self, df: pd.DataFrame) -> float:
        """
        Analyze seasonality strength using autocorrelation
        """
        try:
            if len(df) < 14:
                return 0.0
            
            quantities = df['quantity'].values
            
            # Calculate autocorrelation at lag 7 (weekly seasonality)
            if len(quantities) >= 14:
                autocorr_7 = pd.Series(quantities).autocorr(lag=7)
                if not np.isnan(autocorr_7):
                    return abs(autocorr_7)
            
            return 0.0
            
        except:
            return 0.0
    
    def _assess_outlier_impact(self, quantities: np.ndarray) -> float:
        """
        Assess the impact of outliers on data quality using multiple methods
        """
        try:
            if len(quantities) < 4:
                return 0.0
            
            # Method 1: IQR-based outliers
            Q1, Q3 = np.percentile(quantities, [25, 75])
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            iqr_outliers = np.sum((quantities < lower_bound) | (quantities > upper_bound))
            iqr_outlier_ratio = iqr_outliers / len(quantities)
            
            # Method 2: Z-score based outliers
            z_scores = np.abs(stats.zscore(quantities))
            z_outliers = np.sum(z_scores > 3)
            z_outlier_ratio = z_outliers / len(quantities)
            
            # Method 3: Modified Z-score using median
            median = np.median(quantities)
            mad = np.median(np.abs(quantities - median))
            modified_z_scores = 0.6745 * (quantities - median) / mad if mad > 0 else np.zeros_like(quantities)
            modified_outliers = np.sum(np.abs(modified_z_scores) > 3.5)
            modified_outlier_ratio = modified_outliers / len(quantities)
            
            # Combine methods (take average)
            combined_outlier_ratio = (iqr_outlier_ratio + z_outlier_ratio + modified_outlier_ratio) / 3
            
            return min(1.0, combined_outlier_ratio * 2)  # Scale impact
            
        except:
            return 0.0
    
    def _has_significant_outliers(self, df: pd.DataFrame) -> bool:
        """
        Enhanced outlier detection using multiple statistical methods
        """
        if len(df) < 4:
            return False
        
        quantities = df['quantity'].values
        
        # Method 1: IQR method
        Q1 = np.percentile(quantities, 25)
        Q3 = np.percentile(quantities, 75)
        IQR = Q3 - Q1
        
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        iqr_outliers = np.sum((quantities < lower_bound) | (quantities > upper_bound))
        
        # Method 2: Statistical test (Grubbs' test approximation)
        try:
            z_scores = np.abs(stats.zscore(quantities))
            statistical_outliers = np.sum(z_scores > 3)
        except:
            statistical_outliers = 0
        
        # Method 3: DBSCAN clustering for anomaly detection
        try:
            if len(quantities) >= 10:
                # Reshape for DBSCAN
                X = quantities.reshape(-1, 1)
                scaler = StandardScaler()
                X_scaled = scaler.fit_transform(X)
                
                # DBSCAN clustering
                dbscan = DBSCAN(eps=0.5, min_samples=3)
                clusters = dbscan.fit_predict(X_scaled)
                
                # Count points labeled as noise (-1)
                dbscan_outliers = np.sum(clusters == -1)
            else:
                dbscan_outliers = 0
        except:
            dbscan_outliers = 0
        
        # Consider significant if any method detects > 10% outliers
        total_points = len(quantities)
        outlier_threshold = total_points * 0.1
        
        return (iqr_outliers > outlier_threshold or 
                statistical_outliers > outlier_threshold or 
                dbscan_outliers > outlier_threshold)
    
    def detect_data_anomalies(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Comprehensive anomaly detection for sales data
        """
        anomalies = {
            'sudden_spikes': [],
            'sudden_drops': [],
            'missing_periods': [],
            'irregular_patterns': [],
            'data_quality_issues': []
        }
        
        try:
            quantities = df['quantity'].values
            dates = df['date'].values
            
            # Detect sudden spikes (> 3 standard deviations above rolling mean)
            rolling_mean = pd.Series(quantities).rolling(window=7, min_periods=3).mean()
            rolling_std = pd.Series(quantities).rolling(window=7, min_periods=3).std()
            
            for i, (qty, mean, std) in enumerate(zip(quantities, rolling_mean, rolling_std)):
                if not np.isnan(mean) and not np.isnan(std) and std > 0:
                    if qty > mean + 3 * std:
                        anomalies['sudden_spikes'].append({
                            'date': dates[i].strftime('%Y-%m-%d'),
                            'quantity': int(qty),
                            'expected_range': f"{mean-std:.1f} - {mean+std:.1f}"
                        })
                    elif qty < max(0, mean - 3 * std) and mean > std:
                        anomalies['sudden_drops'].append({
                            'date': dates[i].strftime('%Y-%m-%d'),
                            'quantity': int(qty),
                            'expected_range': f"{mean-std:.1f} - {mean+std:.1f}"
                        })
            
            # Detect missing periods (gaps > 3 days)
            date_diffs = np.diff(dates).astype('timedelta64[D]').astype(int)
            for i, gap in enumerate(date_diffs):
                if gap > 3:
                    anomalies['missing_periods'].append({
                        'start_date': dates[i].strftime('%Y-%m-%d'),
                        'end_date': dates[i+1].strftime('%Y-%m-%d'),
                        'gap_days': int(gap)
                    })
            
            # Detect irregular patterns using autocorrelation
            if len(quantities) >= 14:
                autocorr = pd.Series(quantities).autocorr(lag=7)
                if not np.isnan(autocorr) and abs(autocorr) < 0.1:
                    anomalies['irregular_patterns'].append({
                        'type': 'weak_weekly_pattern',
                        'autocorrelation': float(autocorr),
                        'description': 'Weak or no weekly sales pattern detected'
                    })
            
        except Exception as e:
            anomalies['data_quality_issues'].append({
                'type': 'analysis_error',
                'description': f"Error during anomaly detection: {str(e)}"
            })
        
        return anomalies