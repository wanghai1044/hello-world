#!/bin/bash
echo "==================================="
echo "注册会计师题库系统 - 启动脚本"
echo "==================================="

echo "正在检查Node.js..."
node --version
if [ $? -ne 0 ]; then
    echo "错误：未找到Node.js，请先安装Node.js"
    exit 1
fi

echo "正在安装依赖..."
npm install express body-parser cors --no-optional

echo "正在启动服务器..."
node server-simple.js
