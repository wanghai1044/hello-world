"""
东奥PDF文字识别脚本 - 使用PyMuPDF
"""
import fitz
import os
import sys
import io

# 设置标准输出为UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def extract_text_from_pdf(pdf_path):
    """使用PyMuPDF提取PDF文本"""
    doc = fitz.open(pdf_path)
    text = ""
    for page_num in range(len(doc)):
        page = doc[page_num]
        text += f"\n--- 第{page_num + 1}页 ---\n"
        text += page.get_text()
    doc.close()
    return text

def main():
    downloads_dir = r"C:\Users\Administrator\Downloads"
    output_dir = r"c:\Users\Administrator\CodeBuddy\20260426000922\ocr_output"
    
    os.makedirs(output_dir, exist_ok=True)
    
    # 找到东奥PDF文件
    files = os.listdir(downloads_dir)
    pdf_files = [f for f in files if '东奥' in f and '轻二' in f and f.endswith('.pdf')]
    
    print("东奥PDF文字识别工具 (PyMuPDF)")
    print("=" * 50)
    print(f"找到 {len(pdf_files)} 个PDF文件")
    
    for pdf_file in pdf_files:
        pdf_path = os.path.join(downloads_dir, pdf_file)
        print(f"\n正在处理: {pdf_file}")
        
        try:
            text = extract_text_from_pdf(pdf_path)
            num_pages = len(fitz.open(pdf_path))
            print(f"  总页数: {num_pages}")
            print(f"  文本长度: {len(text)} 字符")
            
            # 输出文件
            output_file = os.path.join(output_dir, pdf_file.replace('.pdf', '.txt'))
            header = f"""来源文件: {pdf_file}
识别方法: PyMuPDF
识别时间: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
总页数: {num_pages}
文本长度: {len(text)} 字符
{'=' * 50}

"""
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(header + text)
            print(f"  [OK] 已保存: {os.path.basename(output_file)}")
        except Exception as e:
            print(f"  [FAIL] 处理失败: {e}")
    
    print("\n" + "=" * 50)
    print("处理完成!")
    print(f"结果保存在: {output_dir}")
    
    # 显示输出文件
    print("\n生成的文本文件:")
    for f in os.listdir(output_dir):
        if f.endswith('.txt'):
            size = os.path.getsize(os.path.join(output_dir, f))
            print(f"  - {f} ({size / 1024 / 1024:.2f} MB)")

if __name__ == "__main__":
    main()
