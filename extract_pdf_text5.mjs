/**
 * 东奥PDF文字识别脚本
 * 使用pdfjs-dist提取文本
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloadsDir = 'C:/Users/Administrator/Downloads/';
const outputDir = path.join(__dirname, 'ocr_output');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 列出Downloads目录中的文件，找到东奥PDF
const files = fs.readdirSync(downloadsDir);
const pdfFiles = files.filter(f => f.includes('东奥') && f.includes('轻二') && f.endsWith('.pdf'));

console.log('东奥PDF文字识别工具');
console.log('='.repeat(50));
console.log(`找到 ${pdfFiles.length} 个PDF文件`);

async function extractTextFromPage(page) {
    const textContent = await page.getTextContent();
    const textItems = textContent.items;
    let text = '';
    
    for (const item of textItems) {
        if ('str' in item) {
            text += item.str;
            if (item.hasEOL) {
                text += '\n';
            }
        }
    }
    
    return text;
}

async function processPDF(pdfFile) {
    const pdfPath = path.join(downloadsDir, pdfFile);
    console.log(`\n正在处理: ${pdfFile}`);
    
    try {
        console.log('  读取PDF...');
        const dataBuffer = fs.readFileSync(pdfPath);
        
        console.log('  解析PDF...');
        const loadingTask = pdfjsLib.getDocument({ data: dataBuffer });
        const pdfDoc = await loadingTask.promise;
        const numPages = pdfDoc.numPages;
        
        console.log(`  总页数: ${numPages}`);
        
        let fullText = '';
        for (let i = 1; i <= numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const pageText = await extractTextFromPage(page);
            fullText += `\n--- 第${i}页 ---\n`;
            fullText += pageText;
            
            if (i % 50 === 0 || i === numPages) {
                console.log(`  已处理 ${i}/${numPages} 页...`);
            }
        }
        
        console.log(`  文本长度: ${fullText.length} 字符`);
        
        // 生成输出文件名
        const outputFile = path.join(outputDir, pdfFile.replace('.pdf', '.txt'));
        
        // 生成文件头
        const header = `来源文件: ${pdfFile}
识别方法: pdf.js
识别时间: ${new Date().toLocaleString('zh-CN')}
总页数: ${numPages}
文本长度: ${fullText.length} 字符
${'='.repeat(50)}

`;
        
        // 保存结果
        fs.writeFileSync(outputFile, header + fullText, 'utf8');
        console.log(`  ✓ 已保存: ${path.basename(outputFile)}`);
        
        return { success: true, file: pdfFile, pages: numPages, chars: fullText.length };
    } catch (error) {
        console.error(`  ✗ 处理失败: ${error.message}`);
        return { success: false, file: pdfFile, error: error.message };
    }
}

async function main() {
    for (const pdfFile of pdfFiles) {
        await processPDF(pdfFile);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('处理完成!');
    console.log(`结果保存在: ${outputDir}`);
    
    // 显示输出文件
    console.log('\n生成的文本文件:');
    const outputFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.txt'));
    for (const f of outputFiles) {
        const size = fs.statSync(path.join(outputDir, f)).size;
        const sizeMB = (size / 1024 / 1024).toFixed(2);
        console.log(`  - ${f} (${sizeMB} MB)`);
    }
}

main().catch(console.error);
