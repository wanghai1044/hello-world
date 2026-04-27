/**
 * 东奥PDF文字识别脚本
 * 使用pdf-parse提取文本
 */
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const pdfFiles = [
    'C:/Users/Administrator/Downloads/东奥-会计-轻二-上册.pdf',
    'C:/Users/Administrator/Downloads/东奥-会计-轻二-下册.pdf'
];

const outputDir = path.join(__dirname, 'ocr_output');

async function extractTextFromPDF(pdfPath) {
    console.log(`\n正在处理: ${path.basename(pdfPath)}`);
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    return data;
}

async function main() {
    console.log('东奥PDF文字识别工具');
    console.log('='.repeat(50));
    
    // 创建输出目录
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    for (const pdfPath of pdfFiles) {
        if (!fs.existsSync(pdfPath)) {
            console.log(`\n✗ 文件不存在: ${pdfPath}`);
            continue;
        }
        
        try {
            const data = await extractTextFromPDF(pdfPath);
            const filename = path.basename(pdfPath);
            
            console.log(`✓ PDF解析成功`);
            console.log(`  总页数: ${data.numpages}`);
            console.log(`  文本长度: ${data.text.length} 字符`);
            
            // 保存文本
            const outputFile = path.join(outputDir, filename.replace('.pdf', '.txt'));
            const header = `来源文件: ${filename}
识别方法: pdf-parse
识别时间: ${new Date().toLocaleString('zh-CN')}
总页数: ${data.numpages}
文本长度: ${data.text.length} 字符
${'='.repeat(50)}

`;
            
            fs.writeFileSync(outputFile, header + data.text, 'utf8');
            console.log(`✓ 结果已保存: ${outputFile}`);
            
        } catch (error) {
            console.error(`✗ 处理失败: ${error.message}`);
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('处理完成!');
    console.log(`结果保存在: ${outputDir}`);
}

main().catch(console.error);
