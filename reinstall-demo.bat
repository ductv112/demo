@echo off
chcp 65001 >nul
title Reinstall demo - clean install for 6 modules

echo ============================================================
echo   Reinstall demo: XOA node_modules cu, cai dat lai tu dau
echo ============================================================
echo.
echo Dung khi setup-demo.bat bao "up to date" nhung start-demo.bat
echo van loi "Cannot find module" (node_modules cu bi corrupt).
echo.
echo Thoi gian: ~20-30 phut tuy mang.
echo.
pause

for %%M in (demo-portal demo-dms demo-chatbot demo-sso demo-taichinhketoan demo-sanxuat) do (
    echo.
    echo ============================================================
    echo   Reinstalling %%M ...
    echo ============================================================
    pushd "%~dp0%%M"
    if exist node_modules (
        echo Xoa node_modules cu...
        rmdir /s /q node_modules
    )
    if exist package-lock.json (
        echo Xoa package-lock.json...
        del /q package-lock.json
    )
    echo Cai dat moi...
    call npm install
    popd
)

echo.
echo ============================================================
echo   Reinstall hoan tat. Bay gio chay start-demo.bat de mo demo.
echo ============================================================
echo.
pause
