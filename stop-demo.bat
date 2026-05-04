@echo off
chcp 65001 >nul
title Stop demo

echo Dung tat ca node.js dev server (gom cac module dang chay)...
taskkill /F /IM node.exe /T >nul 2>&1
echo Done. Tat ca process node.exe da bi dung.
echo.
pause
