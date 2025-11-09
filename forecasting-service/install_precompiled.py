#!/usr/bin/env python3
"""
Install forecasting service using pre-compiled wheels
Avoids compilation issues on Windows
"""

import subprocess
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_pip_install(packages, description=""):
    """Install packages using pip"""
    logger.info(f"Installing: {description}")
    
    cmd = [sys.executable, "-m", "pip", "install"] + packages
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        logger.info(f"✓ {description} installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"✗ Failed to install {description}")
        logger.error(f"Error: {e.stderr}")
        return False

def main():
    """Install with pre-compiled wheels"""
    logger.info("Installing forecasting service with pre-compiled wheels...")
    
    # Upgrade pip first
    logger.info("Upgrading pip...")
    subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], check=True)
    
    # Install packages in order
    package_groups = [
        # Core dependencies
        (["wheel", "setuptools"], "Build tools"),
        (["numpy", "pandas"], "Data processing"),
        (["scipy", "matplotlib"], "Scientific computing"),
        (["scikit-learn"], "Machine learning"),
        (["fastapi", "uvicorn[standard]", "pydantic"], "Web framework"),
        (["python-dateutil"], "Date utilities"),
        
        # Optional advanced packages (may fail)
        (["statsmodels"], "Statistical models (optional)"),
        (["seaborn", "plotly"], "Visualization (optional)"),
    ]
    
    failed_optional = []
    
    for packages, description in package_groups:
        success = run_pip_install(packages, description)
        
        if not success and "optional" in description.lower():
            failed_optional.extend(packages)
            logger.warning(f"Optional package failed: {description}")
        elif not success:
            logger.error(f"Required package failed: {description}")
            return False
    
    # Try Prophet and pmdarima separately (most likely to fail)
    advanced_packages = [
        ("prophet", "Prophet forecasting"),
        ("pmdarima", "Auto-ARIMA"),
    ]
    
    for package, description in advanced_packages:
        success = run_pip_install([package], f"{description} (optional)")
        if not success:
            failed_optional.append(package)
    
    # Test imports
    logger.info("Testing imports...")
    
    required_imports = [
        "fastapi", "uvicorn", "pydantic", "pandas", "numpy", "scipy", "matplotlib"
    ]
    
    for module in required_imports:
        try:
            __import__(module)
            logger.info(f"✓ {module}")
        except ImportError as e:
            logger.error(f"✗ {module}: {e}")
            return False
    
    # Test optional imports
    optional_imports = ["sklearn", "statsmodels", "prophet", "pmdarima", "seaborn", "plotly"]
    available_optional = []
    
    for module in optional_imports:
        try:
            __import__(module)
            logger.info(f"✓ {module} (optional)")
            available_optional.append(module)
        except ImportError:
            logger.warning(f"⚠ {module} not available")
    
    logger.info(f"Available optional modules: {available_optional}")
    
    if failed_optional:
        logger.warning(f"Some optional packages failed: {failed_optional}")
        logger.warning("The service will work with reduced functionality")
    
    logger.info("🎉 Installation completed!")
    logger.info("You can now run: python start_service.py")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)