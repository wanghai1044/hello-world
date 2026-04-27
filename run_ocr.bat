@echo off
chcp 65001 >nul
echo 开始OCR识别...
echo.
"C:\Users\Administrator\AppData\Local\Programs\Python\Python312\python.exe" "c:\Users\Administrator\CodeBuddy\20260426000922\ocr_with_tesseract.py" >> "c:\Users\Administrator\CodeBuddy\20260426000922\ocr_log.txt" 2>&1
echo.
echo 完成！查看日志: c:\Users\Administrator\CodeBuddy\20260426000922\ocr_log.txt
pause
