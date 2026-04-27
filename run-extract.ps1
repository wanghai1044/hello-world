# 东奥PDF文字识别脚本
$ErrorActionPreference = "Stop"
$workingDir = "C:\Users\Administrator\CodeBuddy\20260426000922"

Push-Location $workingDir

try {
    Write-Host "东奥PDF文字识别工具" -ForegroundColor Cyan
    Write-Host ("=" * 50)
    
    # 创建输出目录
    $outputDir = Join-Path $workingDir "ocr_output"
    if (-not (Test-Path $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    }
    
    $pdfFiles = @(
        "C:\Users\Administrator\Downloads\东奥-会计-轻二-上册.pdf",
        "C:\Users\Administrator\Downloads\东奥-会计-轻二-下册.pdf"
    )
    
    foreach ($pdfPath in $pdfFiles) {
        if (-not (Test-Path $pdfPath)) {
            Write-Host "✗ 文件不存在: $pdfPath" -ForegroundColor Red
            continue
        }
        
        $filename = Split-Path $pdfPath -Leaf
        Write-Host "`n正在处理: $filename" -ForegroundColor Yellow
        
        # 运行Node.js脚本处理这个PDF
        $outputFile = Join-Path $outputDir ($filename -replace '\.pdf$', '.txt')
        $logFile = Join-Path $outputDir ($filename -replace '\.pdf$', '.log')
        
        # 创建单独的脚本
        $tempScript = @"
const pdfParse = require('pdf-parse');
const fs = require('fs');

const pdfPath = '$pdfPath';
const outputFile = '$outputFile';

console.log('读取PDF...');
const dataBuffer = fs.readFileSync(pdfPath);
console.log('解析PDF...');
pdfParse(dataBuffer).then(data => {
    console.log('总页数: ' + data.numpages);
    console.log('文本长度: ' + data.text.length);
    
    const header = `来源文件: $filename
识别方法: pdf-parse
识别时间: ${new Date().toLocaleString('zh-CN')}
总页数: ` + data.numpages + `
文本长度: ` + data.text.length + ` 字符
${'='.repeat(50)}

`;
    
    fs.writeFileSync(outputFile, header + data.text, 'utf8');
    console.log('✓ 已保存: ' + outputFile);
}).catch(e => console.error(e));
"@
        
        $tempScriptPath = Join-Path $workingDir "temp_extract.js"
        Set-Content -Path $tempScriptPath -Value $tempScript -Encoding UTF8
        
        Write-Host "  正在提取文本..." -NoNewline
        $result = node $tempScriptPath 2>&1
        Write-Host " 完成" -ForegroundColor Green
        
        # 清理临时脚本
        Remove-Item $tempScriptPath -Force -ErrorAction SilentlyContinue
        
        # 输出日志
        $result | Out-File $logFile -Encoding UTF8
    }
    
    Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
    Write-Host "处理完成!" -ForegroundColor Cyan
    Write-Host "结果保存在: $outputDir" -ForegroundColor Cyan
    
} catch {
    Write-Host "错误: $_" -ForegroundColor Red
} finally {
    Pop-Location
}
