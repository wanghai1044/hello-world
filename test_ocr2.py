"""
测试OCR脚本 - 优化版
"""
import sys
import io
import os
import fitz
import pytesseract
from PIL import Image

# 配置Tesseract路径
pytesseract.pytesseract.tesseract_cmd = r'D:\Program Files\Tesseract-OCR\tesseract.exe'

# 设置标准输出
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

downloads_dir = r"C:\Users\Administrator\Downloads"
pdf_file = "东奥-会计-轻二-上册.pdf"
pdf_path = os.path.join(downloads_dir, pdf_file)

print(f"正在处理: {pdf_file}")

doc = fitz.open(pdf_path)
num_pages = len(doc)
print(f"总页数: {num_pages}")

# 处理第2页测试 (通常是目录页)
for page_num in [1, 10, 50]:
    if page_num >= num_pages:
        continue
    page = doc[page_num]
    
    # 尝试不同的DPI
    for dpi in [200, 300]:
        mat = fitz.Matrix(dpi/72, dpi/72)
        pix = page.get_pixmap(matrix=mat)
        img_data = pix.tobytes("png")
        img = Image.open(io.BytesIO(img_data))
        
        print(f"\n正在OCR识别第{page_num+1}页 (DPI={dpi})...")
        
        # 使用不同PSM模式
        for psm in [6, 4]:
            text = pytesseract.image_to_string(img, lang='chi_sim+eng', config=f'--psm {psm}')
            print(f"  PSM={psm}: {len(text)} 字符")
            if text.strip():
                print(f"  前100字: {text[:100].strip()}")
    
    print("-" * 50)

doc.close()
print("测试完成!")
