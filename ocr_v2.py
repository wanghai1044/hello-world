"""
东奥PDF OCR识别脚本 - 使用PyMuPDF + Tesseract OCR
优化版：降低DPI，减少内存占用
"""
import fitz
import pytesseract
import os
import sys
import io
from PIL import Image
import datetime

# 配置Tesseract路径
pytesseract.pytesseract.tesseract_cmd = r'D:\Program Files\Tesseract-OCR\tesseract.exe'

def process_pdf(pdf_path, output_file, dpi=150):
    """处理单个PDF文件"""
    print(f"正在处理: {os.path.basename(pdf_path)}")
    
    doc = fitz.open(pdf_path)
    num_pages = len(doc)
    print(f"  总页数: {num_pages}")
    
    all_text = []
    
    for page_num in range(num_pages):
        if page_num % 10 == 0:
            print(f"  进度: {page_num + 1}/{num_pages}")
        
        page = doc[page_num]
        # 使用较低DPI以节省内存
        mat = fitz.Matrix(dpi/72, dpi/72)
        pix = page.get_pixmap(matrix=mat)
        
        # 直接从字节创建PIL Image
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        
        # OCR识别
        text = pytesseract.image_to_string(img, lang='chi_sim+eng', config='--psm 6')
        all_text.append(f"\n--- 第{page_num + 1}页 ---\n{text}")
        
        # 显式清理内存
        img.close()
        del img
        pix = None
        
    doc.close()
    
    full_text = ''.join(all_text)
    print(f"  识别完成，文本长度: {len(full_text)} 字符")
    
    # 保存结果
    header = f"""来源文件: {os.path.basename(pdf_path)}
识别方法: PyMuPDF + Tesseract OCR (chi_sim+eng)
识别时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
总页数: {num_pages}
文本长度: {len(full_text)} 字符
{'=' * 50}

"""
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(header + full_text)
    
    print(f"  [OK] 已保存: {os.path.basename(output_file)}")
    return len(full_text)

def main():
    downloads_dir = r"C:\Users\Administrator\Downloads"
    output_dir = r"c:\Users\Administrator\CodeBuddy\20260426000922\ocr_output"
    
    os.makedirs(output_dir, exist_ok=True)
    
    # 找到东奥PDF文件
    files = os.listdir(downloads_dir)
    pdf_files = [f for f in files if '东奥' in f and '轻二' in f and f.endswith('.pdf')]
    
    print("=" * 50)
    print("东奥PDF OCR识别工具")
    print("=" * 50)
    print(f"找到 {len(pdf_files)} 个PDF文件")
    print(f"Tesseract版本: {pytesseract.get_tesseract_version()}")
    print()
    
    total_chars = 0
    for pdf_file in pdf_files:
        pdf_path = os.path.join(downloads_dir, pdf_file)
        output_file = os.path.join(output_dir, pdf_file.replace('.pdf', '_ocr.txt'))
        
        try:
            chars = process_pdf(pdf_path, output_file, dpi=150)
            total_chars += chars
            print()
        except Exception as e:
            print(f"  [FAIL] 处理失败: {e}")
            import traceback
            traceback.print_exc()
    
    print("=" * 50)
    print("处理完成!")
    print(f"总字符数: {total_chars}")
    print(f"结果保存在: {output_dir}")
    
    # 显示输出文件
    print("\n生成的文本文件:")
    for f in os.listdir(output_dir):
        if f.endswith('_ocr.txt'):
            size = os.path.getsize(os.path.join(output_dir, f))
            print(f"  - {f} ({size / 1024 / 1024:.2f} MB)")

if __name__ == "__main__":
    main()
