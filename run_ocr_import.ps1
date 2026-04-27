$python = "C:\Users\Administrator\AppData\Local\Programs\Python\Python312\python.exe"
$script = "c:\Users\Administrator\CodeBuddy\20260426000922\ocr_with_tesseract.py"
$log = "c:\Users\Administrator\CodeBuddy\20260426000922\ocr_log.txt"

& $python $script 2>&1 | Tee-Object -FilePath $log
