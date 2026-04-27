@echo off
echo ===================================
echo 注册会计师题库系统 - 启动脚本
echo ===================================

echo 正在检查Node.js...
node --version
if errorlevel 1 (
    echo 错误：未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo 正在安装依赖...
call npm install express body-parser cors --no-optional

echo 正在启动服务器...
node server-simple.js

pause
