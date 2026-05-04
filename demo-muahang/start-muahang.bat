@echo off
chcp 65001 >nul
title demo-muahang :5177
cd /d %~dp0

if not exist node_modules (
    echo Chua co node_modules. Dang chay npm install...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo *** npm install loi. Dong cua so va kiem tra.
        pause
        exit /b 1
    )
    echo.
)

echo Khoi dong demo-muahang - http://localhost:5177
echo.
call npm run dev
