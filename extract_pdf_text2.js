/**
 * 东奥PDF文字识别脚本
 * 直接使用Node.js处理
 */
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

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

async function processPDF(pdfFile) {
    const pdfPath = path.join(downloadsDir, pdfFile);
    console.log(`\n正在处理: ${pdfFile}`);
    
    try {
        console.log('  读取PDF...');
        const dataBuffer = fs.readFileSync(pdfPath);
        console.log('  解析PDF...');
        const data = await pdfParse(dataBuffer);
        
        console.log(`  总页数: ${data.numpages}`);
        console.log(`  文本长度: ${data.text.length} 字符`);
        
        // 生成输出文件名
        const outputFile = path.join(outputDir, pdfFile.replace('.pdf', '.txt'));
        
        // 生成文件头
        const header = `来源文件: ${pdfFile}
识别方法: pdf-parse
识别时间: ${new Date().toLocaleString('zh-CN')}
总页数: ${data.numpages}
文本长度: ${data.text.length} 字符
${'='.repeat(50)}

`;
        
        // 保存结果
        fs.writeFileSync(outputFile, header + data.text, 'utf8');
        console.log(`  ✓ 已保存: ${path.basename(outputFile)}`);
        
        return { success: true, file: pdfFile };
    } catch (error) {
        console.error(`  ✗ 处理失败: ${error.message}`);
        return { success: false, file: pdfFile };
    }
}

async function main() {
    const results = [];
    
    for (const pdfFile of pdfFiles) {
        const result = await processPDF(pdfFile);
        results.push(result);
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
