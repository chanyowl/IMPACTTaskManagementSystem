@echo off
echo.
echo ========================================
echo   Starting Crystell
echo ========================================
echo.

REM Check if setup is complete
node check-setup.js
if errorlevel 1 (
    echo.
    echo Setup is incomplete. Please fix the issues above first.
    echo See START_HERE.md for instructions.
    pause
    exit /b 1
)

echo.
echo Starting backend and frontend servers...
echo.
echo Backend will run on: http://localhost:3001
echo Frontend will run on: http://localhost:5173
echo.
echo Press Ctrl+C in each window to stop the servers
echo.
pause

REM Start backend in new window
start "Crystell Backend" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in new window
start "Crystell Frontend" cmd /k "cd frontend && npm run dev"

REM Wait a moment then open browser
timeout /t 5 /nobreak > nul
start http://localhost:5173

echo.
echo Crystell is starting!
echo - Backend terminal opened
echo - Frontend terminal opened
echo - Browser should open automatically
echo.
echo To stop: Close the terminal windows or press Ctrl+C in them
echo.
