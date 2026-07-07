@echo off
echo ==========================================
echo    Ganapathi CLI v2.0 - Quick Setup
echo ==========================================
echo.

echo [STEP 1] Installing Ganapathi CLI from PyPI...
pip install ganapathi-mentor-ai
if %errorlevel% neq 0 (
    echo [ERROR] pip install failed. Make sure Python is installed.
    pause
    exit /b 1
)

echo.
echo [STEP 2] Logging in to Ganapathi Mentor AI...
echo  -- Your browser will open. Sign in, copy the token, and paste it here.
python -m ganapathi login
if %errorlevel% neq 0 (
    echo [ERROR] Login failed. Check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo    SETUP COMPLETE!
echo.
echo    To start the Hive Mind bridge, run:
echo    python -m ganapathi hive-mind start --path ./
echo.
echo    All commands use: python -m ganapathi ^<command^>
echo.
echo    Examples:
echo      python -m ganapathi chat
echo      python -m ganapathi predict --file main.py
echo      python -m ganapathi audit .
echo      python -m ganapathi doctor
echo ==========================================
pause
