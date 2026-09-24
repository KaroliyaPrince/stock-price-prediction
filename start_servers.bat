@echo off
title Stock Prediction App Launcher
echo ========================================================
echo   Launching Stock Price Prediction (Backend + Frontend)
echo ========================================================
echo.

echo Starting FastAPI Backend Server on http://127.0.0.1:8000 ...
start "FastAPI Backend (Port 8000)" cmd /k "cd /d "%~dp0backend" && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo Starting React Frontend Server on http://127.0.0.1:5173 ...
start "React Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npx vite --host 127.0.0.1 --port 5173"

echo.
echo ========================================================
echo  Both servers started successfully!
echo  Open browser: http://127.0.0.1:5173
echo ========================================================
pause
