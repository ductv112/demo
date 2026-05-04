@echo off
chcp 65001 >nul
title Setup demo - npm install for 6 modules

echo ============================================================
echo   Setup demo: cai dat dependencies cho 6 module
echo ============================================================
echo.
echo Chay 1 lan dau tien. Tong thoi gian: ~15-30 phut tuy mang.
echo Cac lan sau chi can chay start-demo.bat.
echo.
pause

for %%M in (demo-portal demo-dms demo-chatbot demo-sso demo-taichinhketoan demo-sanxuat) do (
    echo.
    echo ============================================================
    echo   Installing %%M ...
    echo ============================================================
    pushd "%~dp0%%M"
    call npm install
    popd
)

echo.
echo ============================================================
echo   Setup hoan tat. Bay gio chay start-demo.bat de mo demo.
echo ============================================================
echo.
pause
