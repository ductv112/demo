@echo off
chcp 65001 >nul
title Doanh nghiep A - Module launcher menu
setlocal enabledelayedexpansion

:menu
cls
echo ============================================================
echo   Doanh nghiep A - Chon module de mo
echo ============================================================
echo.
echo   1. Portal             :3000   Hub ^& landing (Next.js)
echo   2. SSO                :5173   Dang nhap (Vite)
echo   3. DMS                :3010   Quan ly tai lieu (Next.js)
echo   4. Chatbot            :3011   Chatbot AI (Next.js)
echo.
echo   5. Tai chinh KT       :5175   Finance ^& Accounting
echo   6. Hop dong nhiem vu  :5176   Hop dong du an
echo   7. Mua hang           :5177   IT Procurement
echo   8. Kho                :5178   IT Asset / License
echo   9. San xuat           :5179   Phat trien phan mem
echo.
echo  10. Bao tri            :5180   Bao tri he thong
echo  11. Sua chua           :5181   Sua loi / sua chua
echo  12. Dai tu             :5182   Dai tu he thong
echo  13. Vong doi           :5183   SDLC san pham
echo  14. Do luong           :5187   Do luong chat luong
echo  15. An toan            :5188   IT Security
echo.
echo   q. Thoat
echo.
set "choice="
set /p choice=Chon (1-15 hoac q):

if /i "%choice%"=="q" exit /b 0
if "%choice%"=="" goto menu

set "MOD="
set "PORT="
if "%choice%"=="1"  ( set "MOD=demo-portal"           & set "PORT=3000" )
if "%choice%"=="2"  ( set "MOD=demo-sso"              & set "PORT=5173" )
if "%choice%"=="3"  ( set "MOD=demo-dms"              & set "PORT=3010" )
if "%choice%"=="4"  ( set "MOD=demo-chatbot"          & set "PORT=3011" )
if "%choice%"=="5"  ( set "MOD=demo-taichinhketoan"   & set "PORT=5175" )
if "%choice%"=="6"  ( set "MOD=demo-hopdongnhiemvu"   & set "PORT=5176" )
if "%choice%"=="7"  ( set "MOD=demo-muahang"          & set "PORT=5177" )
if "%choice%"=="8"  ( set "MOD=demo-kho"              & set "PORT=5178" )
if "%choice%"=="9"  ( set "MOD=demo-sanxuat"          & set "PORT=5179" )
if "%choice%"=="10" ( set "MOD=demo-baotri"           & set "PORT=5180" )
if "%choice%"=="11" ( set "MOD=demo-suachua"          & set "PORT=5181" )
if "%choice%"=="12" ( set "MOD=demo-daitu"            & set "PORT=5182" )
if "%choice%"=="13" ( set "MOD=demo-vongdoi"          & set "PORT=5183" )
if "%choice%"=="14" ( set "MOD=demo-doluong"          & set "PORT=5187" )
if "%choice%"=="15" ( set "MOD=demo-antoan"           & set "PORT=5188" )

if not defined MOD (
    echo Lua chon khong hop le.
    timeout /t 2 >nul
    goto menu
)

if not exist "%~dp0!MOD!\node_modules\" (
    echo.
    echo *** Module !MOD! chua cai dependencies ***
    echo Chay setup-demo.bat hoac vao thu muc !MOD! roi npm install truoc.
    echo.
    pause
    goto menu
)

start "!MOD! :!PORT!" /D "%~dp0!MOD!" cmd /k "npm run dev"
echo.
echo Da khoi dong !MOD! - http://localhost:!PORT!
echo Doi 5-15 giay roi mo trinh duyet.
echo.
timeout /t 2 >nul
goto menu
