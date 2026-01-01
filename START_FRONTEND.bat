@echo off
chcp 65001 >nul
echo ========================================
echo   AccounTech AI - Frontend Server
echo ========================================
echo.

cd /d "%~dp0frontend"

if not exist "node_modules\" (
    echo [1/2] نصب پکیج‌های npm...
    call npm install
    echo ✓ پکیج‌ها نصب شدند
    echo.
) else (
    echo ✓ پکیج‌ها موجود هستند
    echo.
)

echo ========================================
echo   🚀 در حال اجرای سرور...
echo   📍 آدرس: http://localhost:5173
echo ========================================
echo.
echo برای توقف سرور، Ctrl+C را فشار دهید
echo.

call npm run dev

pause
