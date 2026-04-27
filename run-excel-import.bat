@echo off
chcp 65001 >nul
echo ========================================
echo    Excel批量导入工具启动脚本
echo ========================================
echo.

cd /d "%~dp0"

REM 检查npm依赖
echo [1/3] 检查依赖...
npm list xlsx >nul 2>&1
if %errorlevel% neq 0 (
    echo 发现缺少依赖，正在安装...
    npm install xlsx
)

REM 运行导入
echo.
echo [2/3] 启动导入程序...
echo.
node excel-import.js

echo.
echo [3/3] 完成
pause
