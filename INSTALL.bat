@echo off
chcp 65001 >nul
cls
echo ========================================
echo   AccounTech AI - نصب و راه‌اندازی
echo ========================================
echo.
echo این اسکریپت تمام نیازمندی‌ها را نصب می‌کند
echo.
pause

echo.
echo [مرحله 1/3] بررسی Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python نصب نیست!
    echo لطفاً Python 3.11+ را از python.org نصب کنید
    pause
    exit /b 1
) else (
    python --version
    echo ✓ Python موجود است
)

echo.
echo [مرحله 2/3] بررسی Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js نصب نیست!
    echo لطفاً Node.js 18+ را از nodejs.org نصب کنید
    pause
    exit /b 1
) else (
    node --version
    echo ✓ Node.js موجود است
)

echo.
echo [مرحله 3/3] نصب پکیج‌ها...
echo.

echo ─────────────────────────────────────
echo   Backend Dependencies
echo ─────────────────────────────────────
cd /d "%~dp0backend"
if not exist "venv\" (
    echo ایجاد محیط مجازی...
    python -m venv venv
)
call venv\Scripts\activate
echo نصب پکیج‌های Python...
pip install -r requirements.txt
echo ✓ Backend آماده است
echo.

echo ─────────────────────────────────────
echo   Frontend Dependencies
echo ─────────────────────────────────────
cd /d "%~dp0frontend"
echo نصب پکیج‌های npm...
call npm install
echo ✓ Frontend آماده است
echo.

echo ─────────────────────────────────────
echo   ایجاد دیتابیس
echo ─────────────────────────────────────
cd /d "%~dp0backend"
call venv\Scripts\activate
python init_db.py
echo ✓ دیتابیس ایجاد شد
echo.

cd /d "%~dp0"

echo.
echo ========================================
echo   ✓ نصب با موفقیت انجام شد!
echo ========================================
echo.
echo برای اجرا، یکی از فایل‌های زیر را دابل‌کلیک کنید:
echo.
echo   • START_ALL.bat      - اجرای کامل (Backend + Frontend)
echo   • START_BACKEND.bat  - فقط Backend
echo   • START_FRONTEND.bat - فقط Frontend
echo.
echo رمز عبور پیش‌فرض: admin
echo.
pause
