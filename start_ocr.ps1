$ErrorActionPreference = "Continue"
$python = "C:\Users\Administrator\AppData\Local\Programs\Python\Python312\python.exe"
$script = "c:\Users\Administrator\CodeBuddy\20260426000922\ocr_v2.py"

Write-Host "Start OCR..."
& $python $script
Write-Host "Done"
