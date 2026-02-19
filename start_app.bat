@echo off
echo Starting Anti-Gravity App...

:: Start Backend
start "AntiGravity Backend" /min cmd /k "cd backend && npm run dev"

:: Start Frontend
start "AntiGravity Frontend" /min cmd /k "cd frontend && npm run dev"

:: Wait for servers to spin up (optional, but good for UX)
timeout /t 5 /nobreak >nul

:: Open Browser
start http://localhost:5173

echo Done! You can close this window, but keep the other two minimized windows open.
pause
