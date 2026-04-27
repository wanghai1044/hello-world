# PDF题库导入指南

## 概述

本指南介绍如何将IMA知识库或其他来源的PDF文件导入到注册会计师题库系统中。

## 方法一：使用PDF解析工具（推荐）

### 步骤1：安装依赖

```bash
cd c:\Users\Administrator\CodeBuddy\20260426000922
npm install pdf-parse
```

### 步骤2：准备PDF文件

在 `pdfs` 文件夹中放入要导入的PDF文件。如果没有该文件夹，程序会自动创建。

```
pdfs\
  ├── IMA知识库-会计.pdf
  ├── IMA知识库-审计.pdf
  └── ...
```

### 步骤3：运行解析工具

```bash
node pdf-parser.js
```

### 步骤4：选择解析方式

程序会提供三种解析方式：

1. **手动输入模式**（最准确）
   - 适合题目数量较少的情况
   - 可以逐题输入，确保准确性

2. **AI辅助解析**（需要配置API）
   - 使用AI自动提取题目
   - 需要配置OpenAI API或其他AI服务

3. **查看文本后手动整理**
   - 程序会提取PDF中的文本保存到 `pdf-text-output.txt`
   - 你可以查看文本文件，手动整理成JSON格式

### 步骤5：导入题目到系统

解析完成后，运行导入工具：

```bash
node import-to-database.js
```

## 方法二：手动整理成JSON格式

如果你有PDF的文本版本，可以手动整理成JSON格式，然后导入。

### JSON格式示例

```json
[
  {
    "subject": "会计",
    "chapter": "第一章 总论",
    "type": "单选题",
    "difficulty": 1,
    "question": "下列关于会计基本假设的表述中，正确的是？",
    "option_a": "会计主体确定了会计核算的空间范围",
    "option_b": "持续经营明确了会计核算的时间范围",
    "option_c": "会计分期是持续经营的前提",
    "option_d": "货币计量为会计核算提供了必要手段",
    "correct_answer": "A",
    "explanation": "会计主体确定了会计核算的空间范围"
  },
  {
    "subject": "会计",
    "chapter": "第一章 总论",
    "type": "多选题",
    "difficulty": 2,
    "question": "下列各项中，属于会计信息质量要求的有？",
    "option_a": "可靠性",
    "option_b": "相关性",
    "option_c": "可理解性",
    "option_d": "可比性",
    "option_e": "实质重于形式",
    "correct_answer": "ABCDE",
    "explanation": "会计信息质量要求包括..."
  }
]
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| subject | 是 | 科目名称（会计、审计、财务成本管理等） |
| chapter | 否 | 章节名称 |
| type | 否 | 题目类型（单选题、多选题、计算题等） |
| difficulty | 否 | 难度等级（1-3，默认1） |
| question | 是 | 题目内容 |
| option_a | 否 | 选项A |
| option_b | 否 | 选项B |
| option_c | 否 | 选项C |
| option_d | 否 | 选项D |
| option_e | 否 | 选项E（用于多选题） |
| correct_answer | 是 | 正确答案（A、AB、ABC等） |
| explanation | 否 | 答案解析 |

### 导入步骤

1. 将整理好的JSON保存为 `imported-questions.json`
2. 运行导入工具：
   ```bash
   node import-to-database.js
   ```
3. 按提示确认导入

## 方法三：使用API批量导入

如果你有程序化需求，可以使用系统的API接口批量导入。

### API接口

**端点：** `POST /api/questions`

**请求头：**
```
Content-Type: application/json
```

**请求体：**
```json
{
  "subject": "会计",
  "chapter": "第一章 总论",
  "type": "单选题",
  "difficulty": 1,
  "question": "题目内容",
  "option_a": "选项A",
  "option_b": "选项B",
  "option_c": "选项C",
  "option_d": "选项D",
  "correct_answer": "A",
  "explanation": "答案解析"
}
```

### 批量导入脚本示例

```javascript
const axios = require('axios');
const fs = require('fs');

const questions = JSON.parse(fs.readFileSync('questions.json', 'utf8'));

async function batchImport() {
    for (const q of questions) {
        try {
            const response = await axios.post('http://localhost:3000/api/questions', q);
            console.log(`✓ 导入成功: ID=${response.data.id}`);
        } catch (error) {
            console.error(`✗ 导入失败: ${q.question.substring(0, 20)}...`);
        }
    }
}

batchImport();
```

## 常见问题

### Q1: PDF解析不准确怎么办？

A: PDF格式复杂，建议：
1. 使用手动输入模式逐题输入
2. 先提取文本，再手动整理成JSON
3. 使用AI辅助解析（需要API配置）

### Q2: 如何批量导入大量题目？

A: 推荐方式：
1. 将题目整理成Excel表格
2. 将Excel转换为JSON格式
3. 使用批量导入脚本

### Q3: 题目格式有哪些注意事项？

A: 
- 正确答案字段不区分大小写，程序会自动转换为大写
- 多选题的答案可以连写（如"ABC"）或用逗号分隔（如"A,B,C"）
- 选项E仅用于多选题，单选题可以不填

### Q4: 如何验证导入是否成功？

A: 
1. 查看导入工具的输出的成功数量
2. 启动服务器，访问 `http://localhost:3000`
3. 进入练习页面，查看题目是否正确显示

## 进阶技巧

### 1. 使用Excel整理题目

1. 创建Excel表格，列名对应JSON字段
2. 填写题目数据
3. 使用在线工具或脚本将Excel转换为JSON
4. 导入到系统

### 2. 题目去重

导入前可以运行去重脚本：

```javascript
const fs = require('fs');

const questions = JSON.parse(fs.readFileSync('questions.json', 'utf8'));
const uniqueQuestions = [];
const questionSet = new Set();

questions.forEach(q => {
    if (!questionSet.has(q.question)) {
        questionSet.add(q.question);
        uniqueQuestions.push(q);
    }
});

fs.writeFileSync('questions-unique.json', JSON.stringify(uniqueQuestions, null, 2));
console.log(`去重完成: ${questions.length} -> ${uniqueQuestions.length}`);
```

### 3. 从网页抓取题目

如果需要从网页抓取题目，可以使用Puppeteer等工具：

```javascript
const puppeteer = require('puppeteer');

async function scrapeQuestions(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    
    // 编写抓取逻辑...
    
    await browser.close();
}
```

## 联系支持

如果遇到问题，可以：
1. 查看 `pdf-parser.js` 和 `import-to-database.js` 的源代码
2. 运行 `node pdf-parser.js` 查看详细错误信息
3. 修改脚本以适应你的PDF格式

---

**祝导入顺利！**
