@echo off
chcp 65001 >nul
title Doanh nghiep A - Demo launcher

echo ============================================================
echo   Doanh nghiep A - Demo launcher (6 module)
echo ============================================================
echo.

REM Pre-flight check: cac module phai co node_modules truoc khi npm run dev.
set MISSING=
for %%M in (demo-portal demo-dms demo-chatbot demo-sso demo-taichinhketoan demo-sanxuat) do (
    if not exist "%~dp0%%M\node_modules\" set MISSING=!MISSING! %%M
)
setlocal enabledelayedexpansion
set MISSING=
for %%M in (demo-portal demo-dms demo-chatbot demo-sso demo-taichinhketoan demo-sanxuat) do (
    if not exist "%~dp0%%M\node_modules\" set "MISSING=!MISSING! %%M"
)

if defined MISSING (
    echo *** Chua cai dependencies cho cac module:!MISSING! ***
    echo.
    echo Hay double-click "setup-demo.bat" TRUOC khi chay file nay.
    echo Setup chi can chay 1 lan dau, mat ~20-30 phut.
    echo.
    pause
    endlocal
    exit /b 1
)
endlocal

echo Mo 6 cua so terminal, moi cua chay 1 module dev server.
echo Server san sang sau ~5-15 giay.
echo.

start "portal :3000"           /D "%~dp0demo-portal"          cmd /k "npm run dev"
start "dms :3010"              /D "%~dp0demo-dms"             cmd /k "npm run dev"
start "chatbot :3011"          /D "%~dp0demo-chatbot"         cmd /k "npm run dev"
start "sso :5173"              /D "%~dp0demo-sso"             cmd /k "npm run dev"
start "taichinhketoan :5175"   /D "%~dp0demo-taichinhketoan"  cmd /k "npm run dev"
start "sanxuat :5179"          /D "%~dp0demo-sanxuat"         cmd /k "npm run dev"

echo Da khoi dong 6 server. Doi 15-30 giay roi mo trinh duyet:
echo.
echo   Portal (Hub):    http://localhost:3000
echo   SSO (Login):     http://localhost:5173
echo   Tai chinh KT:    http://localhost:5175
echo   San xuat:        http://localhost:5179
echo   DMS:             http://localhost:3010
echo   Chatbot:         http://localhost:3011
echo.
echo De dung: dong tung cua so terminal, hoac chay stop-demo.bat.
echo.
pause
