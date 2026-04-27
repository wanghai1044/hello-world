[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "SilentlyContinue"
$workingDir = "C:\Users\Administrator\CodeBuddy\20260426000922"
[System.IO.Directory]::SetCurrentDirectory($workingDir)

Write-Host "东奥PDF文字识别工具"
Write-Host ("=" * 50)

# 创建输出目录
$outputDir = Join-Path $workingDir "ocr_output"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# 获取PDF文件
$downloadsDir = "C:\Users\Administrator\Downloads\"
$pdfFiles = Get-ChildItem -Path $downloadsDir -Filter "东奥-会计-轻二-*.pdf"

Write-Host ("找到 " + $pdfFiles.Count + " 个PDF文件")

foreach ($pdfFile in $pdfFiles) {
    $filename = $pdfFile.Name
    Write-Host ("`n正在处理: " + $filename)
    
    $pdfPath = $pdfFile.FullName
    $outputFile = Join-Path $outputDir ($filename -replace "\.pdf$", ".txt")
    
    # 创建JS脚本内容
    $jsContent = @"
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const pdfPath = '$pdfPath';
const outputFile = '$outputFile';

console.log('读取PDF...');
const dataBuffer = fs.readFileSync(pdfPath);
console.log('解析PDF...');
pdfParse(dataBuffer).then(data => {
    console.log('总页数: ' + data.numpages);
    console.log('文本长度: ' + data.text.length);
    
    const header = '来源文件: ' + path.basename(pdfPath) + '\n' +
        '识别方法: pdf-parse\n' +
        '识别时间: ' + new Date().toLocaleString('zh-CN') + '\n' +
        '总页数: ' + data.numpages + '\n' +
        '文本长度: ' + data.text.length + ' 字符\n' +
        '==================================================\n\n';
    
    fs.writeFileSync(outputFile, header + data.text, 'utf8');
    console.log('已保存: ' + outputFile);
}).catch(e => console.error(e));
"@
    
    $tempScriptPath = Join-Path $workingDir "temp_extract.js"
    Set-Content -Path $tempScriptPath -Value $jsContent -Encoding UTF8
    
    Write-Host "  正在提取文本..." -NoNewline
    $result = node $tempScriptPath 2>&1
    Write-Host " 完成"
    
    # 清理临时脚本
    Remove-Item $tempScriptPath -Force -ErrorAction SilentlyContinue
    
    # 保存日志
    $logFile = Join-Path $outputDir ($filename -replace "\.pdf$", ".log")
    $result | Out-File $logFile -Encoding UTF8
}

Write-Host "`n=================================================="
Write-Host "处理完成!"
Write-Host ("结果保存在: " + $outputDir)

# 显示输出文件
Write-Host "`n生成的文本文件:"
Get-ChildItem $outputDir -Filter "*.txt" | ForEach-Object {
    $sizeMB = [math]::Round($_.Length/1024/1024, 2)
    Write-Host ("  - " + $_.Name + " (" + $sizeMB + " MB)")
}
