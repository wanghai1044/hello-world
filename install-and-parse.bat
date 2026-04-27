@echo off
chcp 65001 >nul
echo ===================================
echo   PDF导入工具 - 一键安装和运行
echo ===================================
echo.

echo [1/4] 检查Node.js...
node --version
if errorlevel 1 (
    echo 错误：未找到Node.js
    pause
    exit /b 1
)

echo.
echo [2/4] 安装依赖包...
call npm install pdf-parse express body-parser cors --no-optional
if errorlevel 1 (
    echo 警告：部分依赖安装失败，尝试继续...
)

echo.
echo [3/4] 创建pdfs文件夹（如果不存在）...
if not exist "pdfs" (
    mkdir pdfs
    echo 已创建 pdfs 文件夹
    echo 请将PDF文件放入此文件夹，然后重新运行此脚本
    pause
    exit /b 0
)

echo.
echo [4/4] 检查PDF文件...
dir pdfs\*.pdf /b 2>nul
if errorlevel 1 (
    echo 未找到PDF文件
    echo 请将PDF文件放入 pdfs 文件夹，然后重新运行此脚本
    pause
    exit /b 0
)

echo.
echo ===================================
echo  开始解析PDF文件
echo ===================================
echo.
node pdf-parser.js

pause
