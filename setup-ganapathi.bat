@echo off
echo ==========================================
echo    Ganapathi Neural CLI - Global Setup
echo ==========================================

:: Check if in the neural-code-symbiosis or ganapathi-core directory
set "ROOT_DIR=%cd%"

if exist "ganapathi-core\setup.py" (
    cd ganapathi-core
) else if exist "setup.py" (
    echo Already in the core directory.
) else (
    echo [ERROR] Run this script from the Ganapathi Mentor AI project root.
    pause
    exit /b 1
)

echo [STEP 1] Installing Ganapathi Neural Core...
pip install -e . --quiet

if %errorlevel% neq 0 (
    echo [ERROR] Installation failed. Ensure Python and Pip are installed.
    pause
    exit /b 1
)

echo [STEP 2] Launching Neural Configuration...
ganapathi setup

echo ==========================================
echo    SETUP COMPLETE!
echo    You can now type 'ganapathi' anywhere.
echo ==========================================
pause
