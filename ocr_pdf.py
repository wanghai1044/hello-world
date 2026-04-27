"""
东奥PDF文字识别脚本
使用pdfplumber提取文本，对于扫描版PDF使用pytesseract OCR
"""
import os
import sys

def extract_text_from_pdf(pdf_path):
    """从PDF中提取文本"""
    try:
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    text += f"\n--- 第{i+1}页 ---\n"
                    text += page_text
            if text.strip():
                return text, "pdfplumber"
    except Exception as e:
        print(f"pdfplumber失败: {e}")
    
    return None, None

def ocr_pdf(pdf_path, dpi=200):
    """对PDF进行OCR文字识别"""
    try:
        from pdf2image import convert_from_path
        import pytesseract
        
        print("正在转换为图片...")
        images = convert_from_path(pdf_path, dpi=dpi)
        
        text = ""
        total = len(images)
        for i, image in enumerate(images):
            print(f"正在识别第 {i+1}/{total} 页...")
            page_text = pytesseract.image_to_string(image, lang='chi_sim+eng')
            text += f"\n--- 第{i+1}页 ---\n"
            text += page_text
        
        return text, "ocr"
    except ImportError as e:
        return None, f"缺少依赖: {e}"
    except Exception as e:
        return None, f"OCR失败: {e}"

def process_pdf(pdf_path, output_dir):
    """处理单个PDF文件"""
    filename = os.path.basename(pdf_path)
    print(f"\n{'='*50}")
    print(f"处理文件: {filename}")
    print('='*50)
    
    # 先尝试直接提取文本
    text, method = extract_text_from_pdf(pdf_path)
    
    if text and text.strip():
        print(f"✓ 使用 {method} 成功提取文本")
        print(f"  文本长度: {len(text)} 字符")
    else:
        print("直接提取文本失败，尝试OCR...")
        text, method = ocr_pdf(pdf_path)
        if text:
            print(f"✓ OCR成功")
            print(f"  文本长度: {len(text)} 字符")
        else:
            print(f"✗ 处理失败: {method}")
            return False
    
    # 保存结果
    output_file = os.path.join(output_dir, filename.replace('.pdf', '.txt'))
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"来源文件: {filename}\n")
        f.write(f"识别方法: {method}\n")
        f.write(f"识别时间: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("="*50 + "\n\n")
        f.write(text)
    
    print(f"✓ 结果已保存: {output_file}")
    return True

def main():
    # PDF文件路径
    pdf_files = [
        r"C:\Users\Administrator\Download\东奥-会计-轻二-上册.pdf",
        r"C:\Users\Administrator\Download\东奥-会计-轻二-下册.pdf"
    ]
    
    # 输出目录
    output_dir = r"c:\Users\Administrator\CodeBuddy\20260426000922\ocr_output"
    os.makedirs(output_dir, exist_ok=True)
    
    print("东奥PDF文字识别工具")
    print("="*50)
    
    results = []
    for pdf_path in pdf_files:
        if os.path.exists(pdf_path):
            success = process_pdf(pdf_path, output_dir)
            results.append((os.path.basename(pdf_path), success))
        else:
            print(f"\n✗ 文件不存在: {pdf_path}")
            results.append((os.path.basename(pdf_path), False))
    
    # 汇总
    print("\n" + "="*50)
    print("处理完成!")
    print("="*50)
    for filename, success in results:
        status = "✓ 成功" if success else "✗ 失败"
        print(f"  {filename}: {status}")
    print(f"\n结果保存在: {output_dir}")

if __name__ == "__main__":
    main()
