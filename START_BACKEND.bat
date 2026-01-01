@echo off
chcp 65001 >nul
echo ========================================
echo   AccounTech AI - Backend Server
echo ========================================
echo.

cd /d "%~dp0backend"

if not exist "venv\" (
    echo [1/4] ایجاد محیط مجازی...
    python -m venv venv
    echo ✓ محیط مجازی ایجاد شد
    echo.
) else (
    echo ✓ محیط مجازی موجود است
    echo.
)

echo [2/4] فعال‌سازی محیط مجازی...
call venv\Scripts\activate
echo ✓ محیط مجازی فعال شد
echo.

echo [3/4] نصب/بروزرسانی پکیج‌ها...
pip install -r requirements.txt --quiet
echo ✓ پکیج‌ها نصب شدند
echo.

if not exist "accounting.db" (
    echo [4/4] ایجاد دیتابیس و حساب‌های پیش‌فرض...
    python init_db.py
    echo ✓ دیتابیس آماده شد
    echo.
) else (
    echo ✓ دیتابیس موجود است
    echo.
)

echo ========================================
echo   🚀 در حال اجرای سرور...
echo   📍 آدرس: http://localhost:8000
echo   📚 مستندات: http://localhost:8000/docs
echo ========================================
echo.
echo برای توقف سرور، Ctrl+C را فشار دهید
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
