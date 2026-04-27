import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'D:\Program Files\Tesseract-OCR\tesseract.exe'
print('Tesseract path:', pytesseract.pytesseract.tesseract_cmd)
try:
    version = pytesseract.get_tesseract_version()
    print('Version:', version)
except Exception as e:
    print('Error:', e)
