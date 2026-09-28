@echo off
title SatQueryAI Backend API
cd /d "%~dp0"
set PYTHONPATH=%~dp0;%~dp0backend
set PATH=%LOCALAPPDATA%\Programs\Python\Python311;%LOCALAPPDATA%\Programs\Python\Python311\Scripts;%PATH%
set PYTHONIOENCODING=utf-8
echo ============================================================
echo Starting SatQueryAI Backend (FastAPI + Uvicorn) on http://127.0.0.1:8000
echo ============================================================
"%LOCALAPPDATA%\Programs\Python\Python311\python.exe" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
pause
