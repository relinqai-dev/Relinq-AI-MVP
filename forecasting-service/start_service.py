#!/usr/bin/env python3
"""
Production-ready startup script for the forecasting service
Includes health checks, monitoring, and graceful shutdown
"""

import os
import sys
import signal
import logging
import asyncio
import uvicorn
from contextlib import asynccontextmanager

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('forecasting_service.log')
    ]
)
logger = logging.getLogger(__name__)

class ForecastingServiceManager:
    """Manages the forecasting service lifecycle"""
    
    def __init__(self):
        self.server = None
        self.shutdown_event = asyncio.Event()
        
    def setup_signal_handlers(self):
        """Setup graceful shutdown signal handlers"""
        def signal_handler(signum, frame):
            logger.info(f"Received signal {signum}, initiating graceful shutdown...")
            self.shutdown_event.set()
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    def validate_environment(self):
        """Validate environment and dependencies"""
        logger.info("Validating environment...")
        
        # Check Python version
        if sys.version_info < (3, 8):
            logger.error("Python 3.8 or higher is required")
            return False
        
        # Check critical imports
        critical_modules = ['fastapi', 'uvicorn', 'pydantic', 'pandas', 'numpy']
        for module in critical_modules:
            try:
                __import__(module)
                logger.info(f"✓ {module}")
            except ImportError as e:
                logger.error(f"✗ Failed to import {module}: {e}")
                return False
        
        # Check optional advanced modules
        advanced_modules = ['sklearn', 'statsmodels', 'prophet', 'pmdarima']
        available_advanced = []
        for module in advanced_modules:
            try:
                __import__(module)
                available_advanced.append(module)
                logger.info(f"✓ {module} (advanced)")
            except ImportError:
                logger.warning(f"⚠ {module} not available")
        
        logger.info(f"Advanced features available: {available_advanced}")
        
        # Validate configuration
        try:
            from config.model_config import DATA_VALIDATION, ARIMA_CONFIG, PROPHET_CONFIG
            logger.info("✓ Configuration loaded successfully")
        except ImportError as e:
            logger.error(f"✗ Failed to load configuration: {e}")
            return False
        
        return True
    
    def run_startup_tests(self):
        """Run basic startup tests"""
        logger.info("Running startup tests...")
        
        try:
            # Test data validator
            from services.data_validator import DataValidator
            validator = DataValidator()
            logger.info("✓ Data validator initialized")
            
            # Test forecast processor
            from services.forecast_processor import ForecastProcessor
            processor = ForecastProcessor()
            logger.info("✓ Forecast processor initialized")
            
            # Test monitoring
            from services.monitoring import performance_monitor
            logger.info("✓ Performance monitor initialized")
            
            return True
            
        except Exception as e:
            logger.error(f"✗ Startup tests failed: {e}")
            return False
    
    async def startup_sequence(self):
        """Complete startup sequence"""
        logger.info("🚀 Starting Forecasting Service...")
        
        # Validate environment
        if not self.validate_environment():
            logger.error("Environment validation failed")
            return False
        
        # Run startup tests
        if not self.run_startup_tests():
            logger.error("Startup tests failed")
            return False
        
        logger.info("✅ Startup sequence completed successfully")
        return True
    
    async def shutdown_sequence(self):
        """Graceful shutdown sequence"""
        logger.info("🛑 Initiating graceful shutdown...")
        
        try:
            # Clear performance metrics if needed
            from services.monitoring import performance_monitor
            logger.info("Saving performance metrics...")
            
            # Export final metrics
            metrics_data = performance_monitor.export_metrics()
            with open('final_metrics.json', 'w') as f:
                f.write(metrics_data)
            
            logger.info("✅ Shutdown sequence completed")
            
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")
    
    def get_server_config(self):
        """Get server configuration"""
        config = {
            "host": os.getenv("HOST", "0.0.0.0"),
            "port": int(os.getenv("PORT", 8000)),
            "log_level": os.getenv("LOG_LEVEL", "info").lower(),
            "workers": int(os.getenv("WORKERS", 1)),
            "reload": os.getenv("RELOAD", "false").lower() == "true",
            "access_log": True,
            "loop": "asyncio",
        }
        
        logger.info(f"Server configuration: {config}")
        return config
    
    async def run_server(self):
        """Run the server with proper lifecycle management"""
        
        # Startup sequence
        if not await self.startup_sequence():
            logger.error("Failed to start service")
            return False
        
        # Setup signal handlers
        self.setup_signal_handlers()
        
        # Get configuration
        config = self.get_server_config()
        
        # Import the FastAPI app
        try:
            from main import app
            logger.info("FastAPI application loaded")
        except ImportError as e:
            logger.error(f"Failed to import FastAPI app: {e}")
            return False
        
        # Create server
        server_config = uvicorn.Config(
            app,
            host=config["host"],
            port=config["port"],
            log_level=config["log_level"],
            access_log=config["access_log"],
            loop=config["loop"]
        )
        
        server = uvicorn.Server(server_config)
        
        # Start server in background
        server_task = asyncio.create_task(server.serve())
        
        logger.info(f"🌟 Forecasting Service started on http://{config['host']}:{config['port']}")
        logger.info("Service is ready to accept requests!")
        
        # Wait for shutdown signal
        await self.shutdown_event.wait()
        
        # Graceful shutdown
        logger.info("Stopping server...")
        server.should_exit = True
        
        # Wait for server to stop
        await server_task
        
        # Run shutdown sequence
        await self.shutdown_sequence()
        
        logger.info("🏁 Forecasting Service stopped")
        return True

def main():
    """Main entry point"""
    manager = ForecastingServiceManager()
    
    try:
        # Run the service
        success = asyncio.run(manager.run_server())
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()