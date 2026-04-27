$python = "C:\Users\Administrator\AppData\Local\Programs\Python\Python312\python.exe"
$script = "c:\Users\Administrator\CodeBuddy\20260426000922\test_ocr2.py"
$log = "c:\Users\Administrator\CodeBuddy\20260426000922\ocr_test_log.txt"

Write-Host "Running OCR test..."
& $python $script *> $log

Write-Host "Done. Check log."
