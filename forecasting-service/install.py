#!/usr/bin/env python3
"""
Robust installation script for the forecasting service
Handles complex dependencies and compilation requirements
"""

import subprocess
import sys
import os
import platform
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_command(command, description=""):
    """Run a command and handle errors"""
    logger.info(f"Running: {description or command}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        logger.info(f"Success: {description}")
        return result
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed: {description}")
        logger.error(f"Error: {e.stderr}")
        return None

def install_system_dependencies():
    """Install system-level dependencies"""
    system = platform.system().lower()
    
    if system == "windows":
        logger.info("Windows detected - checking for Visual Studio Build Tools...")
        # Check if Visual Studio Build Tools are available
        result = run_command("where cl", "Checking for MSVC compiler")
        if not result:
            logger.warning("Microsoft Visual C++ Build Tools not found")
            logger.info("Please install from: https://visualstudio.microsoft.com/visual-cpp-build-tools/")
            logger.info("Or install Visual Studio Community with C++ workload")
            return False
    
    elif system == "darwin":  # macOS
        logger.info("macOS detected - checking for Xcode Command Line Tools...")
        result = run_command("xcode-select -p", "Checking for Xcode tools")
        if not result:
            logger.info("Installing Xcode Command Line Tools...")
            run_command("xcode-select --install", "Installing Xcode tools")
    
    elif system == "linux":
        logger.info("Linux detected - checking for build essentials...")
        # Try to install build essentials (works on Ubuntu/Debian)
        run_command("sudo apt-get update && sudo apt-get install -y build-essential python3-dev", 
                   "Installing build essentials")
    
    return True

def install_python_dependencies():
    """Install Python dependencies in the correct order"""
    
    # Core dependencies first
    core_deps = [
        "wheel",
        "setuptools",
        "Cython>=0.29.0",
        "numpy>=1.24.0",
        "scipy>=1.11.0",
        "pandas>=2.1.0",
    ]
    
    logger.info("Installing core dependencies...")
    for dep in core_deps:
        result = run_command(f"python -m pip install '{dep}'", f"Installing {dep}")
        if not result:
            logger.error(f"Failed to install {dep}")
            return False
    
    # Scientific computing libraries
    scientific_deps = [
        "scikit-learn>=1.3.0",
        "statsmodels>=0.14.0",
        "matplotlib>=3.8.0",
        "seaborn>=0.13.0",
        "plotly>=5.17.0",
    ]
    
    logger.info("Installing scientific computing libraries...")
    for dep in scientific_deps:
        result = run_command(f"python -m pip install '{dep}'", f"Installing {dep}")
        if not result:
            logger.warning(f"Failed to install {dep}, continuing...")
    
    # Time series specific libraries
    ts_deps = [
        "pmdarima>=2.0.0",
    ]
    
    logger.info("Installing time series libraries...")
    for dep in ts_deps:
        result = run_command(f"python -m pip install '{dep}'", f"Installing {dep}")
        if not result:
            logger.warning(f"Failed to install {dep}, continuing...")
    
    # Prophet (most complex dependency)
    logger.info("Installing Prophet (this may take several minutes)...")
    
    # Try different Prophet installation methods
    prophet_methods = [
        "prophet>=1.1.0",
        "prophet --no-deps",  # Skip dependencies if they conflict
        "fbprophet>=0.7.1",   # Fallback to older name
    ]
    
    prophet_installed = False
    for method in prophet_methods:
        logger.info(f"Trying Prophet installation method: {method}")
        result = run_command(f"python -m pip install {method}", f"Installing Prophet via {method}")
        if result:
            prophet_installed = True
            break
        logger.warning(f"Prophet installation method failed: {method}")
    
    if not prophet_installed:
        logger.warning("Prophet installation failed - forecasting will use ARIMA only")
    
    # Web framework dependencies
    web_deps = [
        "fastapi>=0.104.0",
        "uvicorn[standard]>=0.24.0",
        "pydantic>=2.5.0",
        "python-dateutil>=2.8.0",
    ]
    
    logger.info("Installing web framework dependencies...")
    for dep in web_deps:
        result = run_command(f"python -m pip install '{dep}'", f"Installing {dep}")
        if not result:
            logger.error(f"Failed to install {dep}")
            return False
    
    return True

def verify_installation():
    """Verify that all critical components are working"""
    logger.info("Verifying installation...")
    
    critical_imports = [
        "fastapi",
        "uvicorn",
        "pydantic",
        "pandas",
        "numpy",
        "scipy",
        "matplotlib",
    ]
    
    optional_imports = [
        "sklearn",
        "statsmodels",
        "prophet",
        "pmdarima",
        "seaborn",
        "plotly",
    ]
    
    failed_critical = []
    failed_optional = []
    
    for module in critical_imports:
        try:
            __import__(module)
            logger.info(f"✓ {module} imported successfully")
        except ImportError as e:
            logger.error(f"✗ Failed to import {module}: {e}")
            failed_critical.append(module)
    
    for module in optional_imports:
        try:
            __import__(module)
            logger.info(f"✓ {module} imported successfully")
        except ImportError as e:
            logger.warning(f"⚠ Optional module {module} not available: {e}")
            failed_optional.append(module)
    
    if failed_critical:
        logger.error(f"Critical modules failed: {failed_critical}")
        return False
    
    if failed_optional:
        logger.warning(f"Optional modules not available: {failed_optional}")
        logger.warning("Some advanced features may not work")
    
    logger.info("Installation verification completed!")
    return True

def main():
    """Main installation process"""
    logger.info("Starting robust forecasting service installation...")
    
    # Check Python version
    if sys.version_info < (3, 8):
        logger.error("Python 3.8 or higher is required")
        sys.exit(1)
    
    logger.info(f"Python version: {sys.version}")
    
    # Install system dependencies
    if not install_system_dependencies():
        logger.error("System dependencies installation failed")
        sys.exit(1)
    
    # Upgrade pip
    logger.info("Upgrading pip...")
    run_command("python -m pip install --upgrade pip", "Upgrading pip")
    
    # Install Python dependencies
    if not install_python_dependencies():
        logger.error("Python dependencies installation failed")
        sys.exit(1)
    
    # Verify installation
    if not verify_installation():
        logger.error("Installation verification failed")
        sys.exit(1)
    
    logger.info("🎉 Forecasting service installation completed successfully!")
    logger.info("You can now run: python main.py")

if __name__ == "__main__":
    main()