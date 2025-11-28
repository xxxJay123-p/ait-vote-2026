@echo off
echo Starting Voting App with Firebase...
echo.

echo Starting frontend...
start "Frontend" cmd /k "npm run dev"

echo.
echo ✅ Frontend is starting!
echo Frontend: http://localhost:5173
echo.
echo Note: Make sure Firebase is configured in src/config.js
echo.
pause

