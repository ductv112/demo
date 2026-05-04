@echo off
chcp 65001 >nul
title Free demo ports

echo ============================================================
echo   Giai phong port cua demo (3000, 3010, 3011, 5173-5188)
echo ============================================================
echo.

echo [1/2] Kill tat ca node.exe (zombie tu lan chay truoc)...
taskkill /F /IM node.exe /T >nul 2>&1
echo Done.
echo.

echo [2/2] Quet tung port, kill process khac (neu co) dang giu port...
for %%P in (3000 3010 3011 5173 5174 5175 5176 5177 5178 5179 5180 5181 5182 5183 5184 5185 5186 5187 5188) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%P " ^| findstr "LISTENING" 2^>nul') do (
        echo  - Port %%P bi giu boi PID %%a, kill...
        taskkill /F /PID %%a >nul 2>&1
    )
)
echo Done.
echo.

echo ============================================================
echo   Tat ca port demo da san sang. Bay gio chay start-sso.bat
echo   hoac start-menu.bat / start-demo.bat.
echo ============================================================
echo.
pause
