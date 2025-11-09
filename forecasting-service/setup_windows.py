#!/usr/bin/env python3
"""
Comprehensive Windows setup for forecasting service
Handles Visual C++ Build Tools installation and configuration
"""

import subprocess
import sys
import os
import winreg
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WindowsSetup:
    """Handle Windows-specific setup requirements"""
    
    def __init__(self):
        self.vs_installer_url = "https://aka.ms/vs/17/release/vs_buildtools.exe"
        self.build_tools_installed = False
        
    def check_visual_studio_installation(self):
        """Check if Visual Studio or Build Tools are installed"""
        logger.info("Checking for Visual Studio installations...")
        
        # Check registry for Visual Studio installations
        vs_paths = []
        
        try:
            # Check for Visual Studio 2019/2022
            registry_paths = [
                r"SOFTWARE\Microsoft\VisualStudio\SxS\VS7",
                r"SOFTWARE\WOW6432Node\Microsoft\VisualStudio\SxS\VS7"
            ]
            
            for reg_path in registry_paths:
                try:
                    with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, reg_path) as key:
                        i = 0
                        while True:
                            try:
                                name, value, _ = winreg.EnumValue(key, i)
                                if name.startswith("17.") or name.startswith("16."):  # VS 2022/2019
                                    vs_paths.append(value)
                                    logger.info(f"Found Visual Studio at: {value}")
                                i += 1
                            except WindowsError:
                                break
                except WindowsError:
                    continue
                    
        except Exception as e:
            logger.warning(f"Registry check failed: {e}")
        
        # Check for Build Tools specifically
        build_tools_paths = [
            r"C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools",
            r"C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools",
            r"C:\Program Files\Microsoft Visual Studio\2022\BuildTools",
            r"C:\Program Files\Microsoft Visual Studio\2019\BuildTools",
        ]
        
        for path in build_tools_paths:
            if os.path.exists(path):
                vs_paths.append(path)
                logger.info(f"Found Build Tools at: {path}")
        
        return vs_paths
    
    def check_compiler_availability(self):
        """Check if cl.exe is available in PATH"""
        try:
            result = subprocess.run(["where", "cl"], capture_output=True, text=True, check=True)
            cl_path = result.stdout.strip()
            logger.info(f"Found cl.exe at: {cl_path}")
            return True
        except subprocess.CalledProcessError:
            logger.warning("cl.exe not found in PATH")
            return False
    
    def setup_build_environment(self, vs_path):
        """Setup build environment variables"""
        logger.info(f"Setting up build environment for: {vs_path}")
        
        # Common paths for vcvarsall.bat
        vcvarsall_paths = [
            os.path.join(vs_path, "VC", "Auxiliary", "Build", "vcvarsall.bat"),
            os.path.join(vs_path, "BuildTools", "VC", "Auxiliary", "Build", "vcvarsall.bat"),
        ]
        
        for vcvarsall_path in vcvarsall_paths:
            if os.path.exists(vcvarsall_path):
                logger.info(f"Found vcvarsall.bat at: {vcvarsall_path}")
                
                # Create a batch script to setup environment and run Python
                setup_script = f'''
@echo off
call "{vcvarsall_path}" x64
python -c "import os; print('MSVC Environment configured')"
python -m pip install --upgrade pip setuptools wheel
'''
                
                with open("setup_msvc.bat", "w") as f:
                    f.write(setup_script)
                
                try:
                    result = subprocess.run(["setup_msvc.bat"], shell=True, check=True, capture_output=True, text=True)
                    logger.info("MSVC environment setup successful")
                    return True
                except subprocess.CalledProcessError as e:
                    logger.error(f"MSVC setup failed: {e}")
                    continue
        
        return False
    
    def install_build_tools_automatically(self):
        """Attempt to install Build Tools automatically"""
        logger.info("Attempting to install Visual Studio Build Tools...")
        
        try:
            # Download installer
            import urllib.request
            installer_path = "vs_buildtools.exe"
            
            logger.info("Downloading Visual Studio Build Tools installer...")
            urllib.request.urlretrieve(self.vs_installer_url, installer_path)
            
            # Install with required workloads
            install_cmd = [
                installer_path,
                "--quiet", "--wait",
                "--add", "Microsoft.VisualStudio.Workload.VCTools",
                "--add", "Microsoft.VisualStudio.Component.VC.Tools.x86.x64",
                "--add", "Microsoft.VisualStudio.Component.Windows10SDK.19041",
                "--includeRecommended"
            ]
            
            logger.info("Installing Build Tools (this may take 10-15 minutes)...")
            result = subprocess.run(install_cmd, check=True)
            
            logger.info("Build Tools installation completed")
            return True
            
        except Exception as e:
            logger.error(f"Automatic installation failed: {e}")
            return False
    
    def provide_manual_instructions(self):
        """Provide manual installation instructions"""
        logger.info("=" * 60)
        logger.info("MANUAL INSTALLATION REQUIRED")
        logger.info("=" * 60)
        logger.info("")
        logger.info("Please install Microsoft Visual C++ Build Tools manually:")
        logger.info("")
        logger.info("1. Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/")
        logger.info("2. Run the installer")
        logger.info("3. Select 'C++ build tools' workload")
        logger.info("4. Make sure these components are selected:")
        logger.info("   - MSVC v143 - VS 2022 C++ x64/x86 build tools")
        logger.info("   - Windows 10/11 SDK (latest version)")
        logger.info("   - CMake tools for Visual Studio")
        logger.info("5. Click Install")
        logger.info("")
        logger.info("Alternative: Install Visual Studio Community with C++ workload")
        logger.info("")
        logger.info("After installation, restart your command prompt and run this script again.")
        logger.info("=" * 60)
    
    def install_python_packages_with_msvc(self):
        """Install Python packages with MSVC environment"""
        logger.info("Installing Python packages with MSVC environment...")
        
        # Create installation script that uses MSVC environment
        install_script = '''
@echo off
echo Setting up MSVC environment...

REM Try different Visual Studio versions
set "VSWHERE=%ProgramFiles(x86)%\\Microsoft Visual Studio\\Installer\\vswhere.exe"
if exist "%VSWHERE%" (
    for /f "usebackq tokens=*" %%i in (`"%VSWHERE%" -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath`) do (
        set "VS_PATH=%%i"
    )
)

if defined VS_PATH (
    echo Found Visual Studio at: %VS_PATH%
    call "%VS_PATH%\\VC\\Auxiliary\\Build\\vcvarsall.bat" x64
) else (
    echo Trying fallback paths...
    if exist "C:\\Program Files (x86)\\Microsoft Visual Studio\\2022\\BuildTools\\VC\\Auxiliary\\Build\\vcvarsall.bat" (
        call "C:\\Program Files (x86)\\Microsoft Visual Studio\\2022\\BuildTools\\VC\\Auxiliary\\Build\\vcvarsall.bat" x64
    ) else if exist "C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\BuildTools\\VC\\Auxiliary\\Build\\vcvarsall.bat" (
        call "C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\BuildTools\\VC\\Auxiliary\\Build\\vcvarsall.bat" x64
    ) else (
        echo ERROR: Could not find Visual Studio Build Tools
        exit /b 1
    )
)

echo MSVC environment configured
echo Installing Python packages...

python -m pip install --upgrade pip setuptools wheel
python -m pip install numpy pandas scipy matplotlib
python -m pip install scikit-learn
python -m pip install statsmodels
python -m pip install fastapi uvicorn pydantic python-dateutil
python -m pip install pmdarima
python -m pip install prophet

echo Installation completed!
'''
        
        with open("install_with_msvc.bat", "w") as f:
            f.write(install_script)
        
        try:
            result = subprocess.run(["install_with_msvc.bat"], shell=True, check=True)
            logger.info("✅ Python packages installed successfully with MSVC")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Package installation failed: {e}")
            return False
    
    def run_setup(self):
        """Run complete setup process"""
        logger.info("🚀 Starting Windows setup for forecasting service...")
        
        # Check current state
        vs_installations = self.check_visual_studio_installation()
        compiler_available = self.check_compiler_availability()
        
        if compiler_available:
            logger.info("✅ Compiler already available, proceeding with installation...")
            return self.install_python_packages_with_msvc()
        
        if vs_installations:
            logger.info("Visual Studio found but compiler not in PATH")
            for vs_path in vs_installations:
                if self.setup_build_environment(vs_path):
                    return self.install_python_packages_with_msvc()
        
        # Try automatic installation
        logger.info("No suitable Visual Studio installation found")
        logger.info("Attempting automatic installation...")
        
        if self.install_build_tools_automatically():
            # Wait a moment for installation to complete
            import time
            time.sleep(5)
            
            # Check again
            if self.check_compiler_availability():
                return self.install_python_packages_with_msvc()
        
        # Provide manual instructions
        self.provide_manual_instructions()
        return False

def main():
    """Main setup function"""
    setup = WindowsSetup()
    success = setup.run_setup()
    
    if success:
        logger.info("🎉 Setup completed successfully!")
        logger.info("You can now run: python start_service.py")
    else:
        logger.error("❌ Setup failed. Please follow the manual instructions above.")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)