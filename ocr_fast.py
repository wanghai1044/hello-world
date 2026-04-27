"""
东奥PDF OCR识别脚本 - 快速版
单页处理，直接写入文件
"""
import fitz
import pytesseract
import os
import sys
import io
from PIL import Image
import datetime

pytesseract.pytesseract.tesseract_cmd = r'D:\Program Files\Tesseract-OCR\tesseract.exe'

def process_pdf(pdf_path, output_file, dpi=150):
    """处理单个PDF文件"""
    print(f"开始处理: {os.path.basename(pdf_path)}", flush=True)
    
    doc = fitz.open(pdf_path)
    num_pages = len(doc)
    print(f"总页数: {num_pages}", flush=True)
    
    # 打开输出文件，立即写入
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"来源文件: {os.path.basename(pdf_path)}\n")
        f.write(f"识别方法: PyMuPDF + Tesseract OCR (chi_sim+eng)\n")
        f.write(f"识别时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"总页数: {num_pages}\n")
        f.write("=" * 50 + "\n\n")
        f.flush()
        
        for page_num in range(num_pages):
            if page_num % 20 == 0:
                print(f"进度: {page_num + 1}/{num_pages}", flush=True)
            
            page = doc[page_num]
            mat = fitz.Matrix(dpi/72, dpi/72)
            pix = page.get_pixmap(matrix=mat)
            
            # 直接从字节创建PIL Image
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            
            # OCR识别
            try:
                text = pytesseract.image_to_string(img, lang='chi_sim+eng', config='--psm 6')
            except Exception as e:
                text = f"[OCR错误: {e}]"
            
            f.write(f"\n--- 第{page_num + 1}页 ---\n")
            f.write(text)
            f.write("\n")
            f.flush()  # 立即刷新到磁盘
            
            # 清理内存
            img.close()
            del img, pix
        
        f.write(f"\n\n文本总长度: {f.tell()} 字符\n")
    
    doc.close()
    print(f"完成: {os.path.basename(output_file)}", flush=True)

def main():
    downloads_dir = r"C:\Users\Administrator\Downloads"
    output_dir = r"c:\Users\Administrator\CodeBuddy\20260426000922\ocr_output"
    
    os.makedirs(output_dir, exist_ok=True)
    
    # 找到东奥PDF文件
    files = os.listdir(downloads_dir)
    pdf_files = [f for f in files if '东奥' in f and '轻二' in f and f.endswith('.pdf')]
    
    print("=" * 50, flush=True)
    print("东奥PDF OCR识别工具 - 快速版", flush=True)
    print("=" * 50, flush=True)
    print(f"找到 {len(pdf_files)} 个PDF文件", flush=True)
    
    for pdf_file in pdf_files:
        pdf_path = os.path.join(downloads_dir, pdf_file)
        output_file = os.path.join(output_dir, pdf_file.replace('.pdf', '_ocr.txt'))
        
        try:
            process_pdf(pdf_path, output_file, dpi=150)
        except Exception as e:
            print(f"错误: {e}", flush=True)
            import traceback
            traceback.print_exc()
    
    print("=" * 50, flush=True)
    print("全部完成!", flush=True)

if __name__ == "__main__":
    main()
