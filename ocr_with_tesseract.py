"""
东奥PDF OCR识别脚本 - 使用PyMuPDF + Tesseract OCR
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

# 设置标准输出为UTF-8（仅在有控制台时）
if sys.stdout and hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def pdf_to_images(pdf_path, dpi=200):
    """将PDF每一页转换为图片"""
    doc = fitz.open(pdf_path)
    images = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        # 设置较高的分辨率以获得更好的OCR效果
        mat = fitz.Matrix(dpi/72, dpi/72)
        pix = page.get_pixmap(matrix=mat)
        img_data = pix.tobytes("png")
        img = Image.open(io.BytesIO(img_data))
        images.append(img)
    doc.close()
    return images

def ocr_image(img, lang='chi_sim+eng'):
    """对图片进行OCR识别"""
    text = pytesseract.image_to_string(img, lang=lang, config='--psm 6')
    return text

def main():
    downloads_dir = r"C:\Users\Administrator\Downloads"
    output_dir = r"c:\Users\Administrator\CodeBuddy\20260426000922\ocr_output"
    
    os.makedirs(output_dir, exist_ok=True)
    
    # 找到东奥PDF文件
    files = os.listdir(downloads_dir)
    pdf_files = [f for f in files if '东奥' in f and '轻二' in f and f.endswith('.pdf')]
    
    print("东奥PDF OCR识别工具")
    print("=" * 50)
    print(f"找到 {len(pdf_files)} 个PDF文件")
    print(f"Tesseract版本: {pytesseract.get_tesseract_version()}")
    print()
    
    for pdf_file in pdf_files:
        pdf_path = os.path.join(downloads_dir, pdf_file)
        print(f"正在处理: {pdf_file}")
        print(f"  正在转换为图片...")
        
        try:
            doc = fitz.open(pdf_path)
            num_pages = len(doc)
            doc.close()
            print(f"  总页数: {num_pages}")
            
            # 分批处理，每50页保存一次
            batch_size = 50
            all_text = []
            
            for batch_start in range(0, num_pages, batch_size):
                batch_end = min(batch_start + batch_size, num_pages)
                print(f"  正在识别第 {batch_start + 1}-{batch_end} 页...")
                
                doc = fitz.open(pdf_path)
                batch_text = []
                
                for page_num in range(batch_start, batch_end):
                    page = doc[page_num]
                    # 转换为图片 (300 DPI)
                    mat = fitz.Matrix(300/72, 300/72)
                    pix = page.get_pixmap(matrix=mat)
                    img_data = pix.tobytes("png")
                    img = Image.open(io.BytesIO(img_data))
                    
                    # OCR识别
                    text = pytesseract.image_to_string(img, lang='chi_sim+eng', config='--psm 6')
                    batch_text.append(f"\n--- 第{page_num + 1}页 ---\n{text}")
                
                doc.close()
                all_text.extend(batch_text)
                
                # 每批处理完后打印进度
                print(f"    已完成: {batch_end}/{num_pages} 页")
            
            full_text = ''.join(all_text)
            print(f"  识别完成，文本长度: {len(full_text)} 字符")
            
            # 输出文件
            output_file = os.path.join(output_dir, pdf_file.replace('.pdf', '_ocr.txt'))
            header = f"""来源文件: {pdf_file}
识别方法: PyMuPDF + Tesseract OCR (chi_sim+eng)
识别时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
总页数: {num_pages}
文本长度: {len(full_text)} 字符
{'=' * 50}

"""
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(header + full_text)
            print(f"  [OK] 已保存: {os.path.basename(output_file)}")
            print()
            
        except Exception as e:
            print(f"  [FAIL] 处理失败: {e}")
            import traceback
            traceback.print_exc()
    
    print("=" * 50)
    print("处理完成!")
    print(f"结果保存在: {output_dir}")
    
    # 显示输出文件
    print("\n生成的文本文件:")
    for f in os.listdir(output_dir):
        if f.endswith('_ocr.txt'):
            size = os.path.getsize(os.path.join(output_dir, f))
            print(f"  - {f} ({size / 1024 / 1024:.2f} MB)")

if __name__ == "__main__":
    main()
