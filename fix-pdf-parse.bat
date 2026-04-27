@echo off
chcp 65001 >nul
echo ===================================
echo   修复 pdf-parse 安装问题
echo ===================================
echo.

echo [1/4] 卸载旧版本...
call npm uninstall pdf-parse

echo.
echo [2/4] 清理npm缓存...
call npm cache clean --force

echo.
echo [3/4] 重新安装 pdf-parse...
call npm install pdf-parse --no-optional

if errorlevel 1 (
    echo.
    echo ⚠️  正常安装失败，尝试使用 --force...
    call npm install pdf-parse --force
)

echo.
echo [4/4] 测试安装...
node -e "try { const pdf = require('pdf-parse'); console.log('✓ pdf-parse 安装成功！'); } catch(e) { console.log('✗ 安装失败:', e.message); }"

echo.
pause
