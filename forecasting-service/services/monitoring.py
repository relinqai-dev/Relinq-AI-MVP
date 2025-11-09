"""
Monitoring and metrics collection for forecasting service
"""

import time
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import json
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import threading

logger = logging.getLogger(__name__)

@dataclass
class ForecastMetrics:
    """Metrics for a single forecast operation"""
    timestamp: datetime
    sku: str
    user_id: str
    model_used: str
    processing_time_ms: float
    data_points: int
    forecast_days: int
    confidence_score: float
    data_quality_score: float
    success: bool
    error_message: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for logging/storage"""
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

class PerformanceMonitor:
    """
    Monitor and collect performance metrics for the forecasting service
    """
    
    def __init__(self, max_history_size: int = 1000):
        self.max_history_size = max_history_size
        self.metrics_history = deque(maxlen=max_history_size)
        self.model_performance = defaultdict(list)
        self.error_counts = defaultdict(int)
        self.processing_times = deque(maxlen=100)  # Last 100 processing times
        self._lock = threading.Lock()
        
        # Performance thresholds
        self.slow_request_threshold_ms = 5000  # 5 seconds
        self.low_confidence_threshold = 0.3
        self.low_quality_threshold = 0.5
    
    def record_forecast_metrics(self, metrics: ForecastMetrics):
        """Record metrics for a forecast operation"""
        with self._lock:
            self.metrics_history.append(metrics)
            self.model_performance[metrics.model_used].append({
                'confidence': metrics.confidence_score,
                'quality': metrics.data_quality_score,
                'processing_time': metrics.processing_time_ms,
                'success': metrics.success
            })
            self.processing_times.append(metrics.processing_time_ms)
            
            if not metrics.success:
                self.error_counts[metrics.error_message or 'unknown_error'] += 1
            
            # Log performance issues
            if metrics.processing_time_ms > self.slow_request_threshold_ms:
                logger.warning(f"Slow forecast request: {metrics.processing_time_ms:.2f}ms for SKU {metrics.sku}")
            
            if metrics.success and metrics.confidence_score < self.low_confidence_threshold:
                logger.warning(f"Low confidence forecast: {metrics.confidence_score:.3f} for SKU {metrics.sku}")
            
            if metrics.success and metrics.data_quality_score < self.low_quality_threshold:
                logger.warning(f"Low data quality: {metrics.data_quality_score:.3f} for SKU {metrics.sku}")
    
    def get_performance_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get performance summary for the last N hours"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        with self._lock:
            recent_metrics = [m for m in self.metrics_history if m.timestamp >= cutoff_time]
            
            if not recent_metrics:
                return {"message": "No metrics available for the specified time period"}
            
            total_requests = len(recent_metrics)
            successful_requests = sum(1 for m in recent_metrics if m.success)
            failed_requests = total_requests - successful_requests
            
            # Processing time statistics
            processing_times = [m.processing_time_ms for m in recent_metrics]
            avg_processing_time = sum(processing_times) / len(processing_times)
            max_processing_time = max(processing_times)
            min_processing_time = min(processing_times)
            
            # Confidence and quality statistics
            successful_metrics = [m for m in recent_metrics if m.success]
            if successful_metrics:
                avg_confidence = sum(m.confidence_score for m in successful_metrics) / len(successful_metrics)
                avg_quality = sum(m.data_quality_score for m in successful_metrics) / len(successful_metrics)
                
                # Model usage statistics
                model_usage = defaultdict(int)
                for m in successful_metrics:
                    model_usage[m.model_used] += 1
            else:
                avg_confidence = 0
                avg_quality = 0
                model_usage = {}
            
            # Error analysis
            recent_errors = defaultdict(int)
            for m in recent_metrics:
                if not m.success and m.error_message:
                    recent_errors[m.error_message] += 1
            
            return {
                "time_period_hours": hours,
                "total_requests": total_requests,
                "successful_requests": successful_requests,
                "failed_requests": failed_requests,
                "success_rate": successful_requests / total_requests if total_requests > 0 else 0,
                "performance": {
                    "avg_processing_time_ms": round(avg_processing_time, 2),
                    "max_processing_time_ms": round(max_processing_time, 2),
                    "min_processing_time_ms": round(min_processing_time, 2),
                    "slow_requests": sum(1 for t in processing_times if t > self.slow_request_threshold_ms)
                },
                "forecast_quality": {
                    "avg_confidence_score": round(avg_confidence, 3),
                    "avg_data_quality_score": round(avg_quality, 3),
                    "low_confidence_forecasts": sum(1 for m in successful_metrics if m.confidence_score < self.low_confidence_threshold),
                    "low_quality_data": sum(1 for m in successful_metrics if m.data_quality_score < self.low_quality_threshold)
                },
                "model_usage": dict(model_usage),
                "recent_errors": dict(recent_errors)
            }
    
    def get_model_performance_comparison(self) -> Dict[str, Any]:
        """Compare performance across different models"""
        with self._lock:
            comparison = {}
            
            for model_name, performances in self.model_performance.items():
                if not performances:
                    continue
                
                successful_runs = [p for p in performances if p['success']]
                
                if successful_runs:
                    comparison[model_name] = {
                        "total_runs": len(performances),
                        "successful_runs": len(successful_runs),
                        "success_rate": len(successful_runs) / len(performances),
                        "avg_confidence": sum(p['confidence'] for p in successful_runs) / len(successful_runs),
                        "avg_quality": sum(p['quality'] for p in successful_runs) / len(successful_runs),
                        "avg_processing_time_ms": sum(p['processing_time'] for p in successful_runs) / len(successful_runs),
                        "confidence_std": self._calculate_std([p['confidence'] for p in successful_runs]),
                        "quality_std": self._calculate_std([p['quality'] for p in successful_runs])
                    }
            
            return comparison
    
    def _calculate_std(self, values: list) -> float:
        """Calculate standard deviation"""
        if len(values) < 2:
            return 0.0
        
        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / (len(values) - 1)
        return variance ** 0.5
    
    def export_metrics(self, format: str = 'json') -> str:
        """Export metrics in specified format"""
        with self._lock:
            if format.lower() == 'json':
                metrics_data = [m.to_dict() for m in self.metrics_history]
                return json.dumps(metrics_data, indent=2, default=str)
            else:
                raise ValueError(f"Unsupported export format: {format}")
    
    def clear_metrics(self):
        """Clear all stored metrics"""
        with self._lock:
            self.metrics_history.clear()
            self.model_performance.clear()
            self.error_counts.clear()
            self.processing_times.clear()
            logger.info("All metrics cleared")

# Global monitor instance
performance_monitor = PerformanceMonitor()

class ForecastTimer:
    """Context manager for timing forecast operations"""
    
    def __init__(self, sku: str, user_id: str):
        self.sku = sku
        self.user_id = user_id
        self.start_time = None
        self.end_time = None
    
    def __enter__(self):
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = time.time()
    
    def get_duration_ms(self) -> float:
        """Get duration in milliseconds"""
        if self.start_time and self.end_time:
            return (self.end_time - self.start_time) * 1000
        return 0.0
    
    def record_metrics(self, model_used: str, data_points: int, forecast_days: int,
                      confidence_score: float, data_quality_score: float,
                      success: bool, error_message: Optional[str] = None):
        """Record metrics for this forecast operation"""
        metrics = ForecastMetrics(
            timestamp=datetime.now(),
            sku=self.sku,
            user_id=self.user_id,
            model_used=model_used,
            processing_time_ms=self.get_duration_ms(),
            data_points=data_points,
            forecast_days=forecast_days,
            confidence_score=confidence_score,
            data_quality_score=data_quality_score,
            success=success,
            error_message=error_message
        )
        
        performance_monitor.record_forecast_metrics(metrics)