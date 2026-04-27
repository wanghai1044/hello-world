# 东奥PDF文字识别脚本
$ErrorActionPreference = "SilentlyContinue"
$workingDir = "C:\Users\Administrator\CodeBuddy\20260426000922"

Push-Location $workingDir

Write-Host "东奥PDF文字识别工具" -ForegroundColor Cyan
Write-Host ("=" * 50)

# 创建输出目录
$outputDir = Join-Path $workingDir "ocr_output"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# 使用通配符匹配PDF文件
$pdfPattern = "C:\Users\Administrator\Downloads\东奥-会计-轻二-*.pdf"
$pdfFiles = Get-ChildItem -Path $pdfPattern

Write-Host "找到 $($pdfFiles.Count) 个PDF文件" -ForegroundColor Yellow

foreach ($pdfFile in $pdfFiles) {
    $filename = $pdfFile.Name
    Write-Host "`n正在处理: $filename" -ForegroundColor Yellow
    
    $outputFile = Join-Path $outputDir ($filename -replace '\.pdf$', '.txt')
    $logFile = Join-Path $outputDir ($filename -replace '\.pdf$', '.log')
    
    # 创建单独的脚本
    $pdfPath = $pdfFile.FullName
    $tempScript = @"
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const pdfPath = '$pdfPath'.replace(/'/g, '');
const outputFile = '$outputFile'.replace(/'/g, '');

console.log('读取PDF...');
const dataBuffer = fs.readFileSync(pdfPath);
console.log('解析PDF...');
pdfParse(dataBuffer).then(data => {
    console.log('总页数: ' + data.numpages);
    console.log('文本长度: ' + data.text.length);
    
    const header = '来源文件: ' + path.basename(pdfPath) + `
识别方法: pdf-parse
识别时间: ${new Date().toLocaleString('zh-CN')}
总页数: ` + data.numpages + `
文本长度: ` + data.text.length + ` 字符
${'='.repeat(50)}

`;
    
    fs.writeFileSync(outputFile, header + data.text, 'utf8');
    console.log('已保存: ' + outputFile);
}).catch(e => console.error(e));
"@
    
    $tempScriptPath = Join-Path $workingDir "temp_extract.js"
    Set-Content -Path $tempScriptPath -Value $tempScript -Encoding UTF8
    
    Write-Host "  正在提取文本..." -NoNewline
    $result = node $tempScriptPath 2>&1
    Write-Host " 完成" -ForegroundColor Green
    
    # 清理临时脚本
    Remove-Item $tempScriptPath -Force -ErrorAction SilentlyContinue
    
    # 保存日志
    $result | Out-File $logFile -Encoding UTF8
    
    Write-Host "  日志: $logFile"
}

Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "处理完成!" -ForegroundColor Cyan
Write-Host "结果保存在: $outputDir" -ForegroundColor Cyan

# 显示输出文件
Write-Host "`n生成的文本文件:" -ForegroundColor Yellow
Get-ChildItem $outputDir -Filter "*.txt" | ForEach-Object {
    Write-Host "  - $($_.Name) ($([math]::Round($_.Length/1024/1024, 2)) MB)"
}

Pop-Location
