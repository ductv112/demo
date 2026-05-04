@echo off
chcp 65001 >nul
title Start SSO only

if not exist "%~dp0demo-sso\node_modules\" (
    echo *** Chua cai dependencies cho demo-sso ***
    echo Hay chay setup-demo.bat truoc.
    echo.
    pause
    exit /b 1
)

start "sso :5173" /D "%~dp0demo-sso" cmd /k "npm run dev"

echo Da khoi dong SSO. Doi 5-10 giay roi mo:
echo   http://localhost:5173
echo.
echo De them module khac, chay start-menu.bat.
echo.
pause
