@echo off
echo 🚀 Starting Career Line Backend Server...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

echo ✅ Starting server on http://localhost:5000
echo 📝 Press Ctrl+C to stop the server
echo.

REM Start the server
call npm start

pause

