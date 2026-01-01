@echo off
chcp 65001 >nul
echo ========================================
echo   AccounTech AI - راه‌اندازی کامل
echo ========================================
echo.
echo این اسکریپت Backend و Frontend را به صورت همزمان اجرا می‌کند
echo.
echo ⚠️  دو پنجره ترمینال باز می‌شود:
echo    1. Backend Server (Port 8000)
echo    2. Frontend Server (Port 5173)
echo.
echo برای توقف، هر دو پنجره را ببندید یا Ctrl+C بزنید
echo.
pause

start "AccounTech AI - Backend" cmd /k "%~dp0START_BACKEND.bat"
timeout /t 5 /nobreak >nul
start "AccounTech AI - Frontend" cmd /k "%~dp0START_FRONTEND.bat"

echo.
echo ========================================
echo   ✓ هر دو سرور در حال اجرا هستند
echo ========================================
echo.
echo 📍 Frontend: http://localhost:5173
echo 📍 Backend: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo رمز عبور پیش‌فرض: admin
echo.
pause
