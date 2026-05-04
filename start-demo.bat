@echo off
chcp 65001 >nul
title Doanh nghiep A - Demo launcher

echo ============================================================
echo   Doanh nghiep A - Demo launcher
echo ============================================================
echo.
echo Mo 6 cua so terminal, moi cua chay 1 module dev server.
echo.
echo Lan dau chay  : tu dong "npm install" (~3-5 phut/module).
echo Lan sau       : server san sang sau ~5-15 giay.
echo.

start "portal :3000"          /D "%~dp0demo-portal"          cmd /k "if not exist node_modules (npm install) && npm run dev"
start "dms :3010"             /D "%~dp0demo-dms"             cmd /k "if not exist node_modules (npm install) && npm run dev"
start "chatbot :3011"         /D "%~dp0demo-chatbot"         cmd /k "if not exist node_modules (npm install) && npm run dev"
start "sso :5173"             /D "%~dp0demo-sso"             cmd /k "if not exist node_modules (npm install) && npm run dev"
start "taichinhketoan :5175"  /D "%~dp0demo-taichinhketoan"  cmd /k "if not exist node_modules (npm install) && npm run dev"
start "sanxuat :5179"         /D "%~dp0demo-sanxuat"         cmd /k "if not exist node_modules (npm install) && npm run dev"

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
