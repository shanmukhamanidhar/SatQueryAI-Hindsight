@echo off
title SatQueryAI Mission Control Frontend
cd /d "%~dp0\frontend"
set PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%
echo ============================================================
echo Starting SatQueryAI Frontend on http://localhost:3000
echo ============================================================
call npm run dev
pause
