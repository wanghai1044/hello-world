/**
 * Excel批量导入工具
 * 功能：将Excel格式的题库批量导入到CPA题库系统
 * 
 * 使用方法：
 * 1. 安装依赖：npm install xlsx
 * 2. 准备Excel文件（参考 题目导入模板.xlsx）
 * 3. 运行：node excel-import.js
 */

const fs = require('fs');
const path = require('path');

// 检查并安装xlsx依赖
function checkXlsxDependency() {
    try {
        require('xlsx');
        return true;
    } catch (e) {
        console.log('⚠️  需要安装 xlsx 依赖库...');
        console.log('请运行以下命令安装：');
        console.log('npm install xlsx\n');
        return false;
    }
}

// Excel字段映射
const FIELD_MAPPING = {
    '科目': 'subject',
    '章节': 'chapter',
    '题目类型': 'type',
    '难度': 'difficulty',
    '题目内容': 'question',
    '选项A': 'option_a',
    '选项B': 'option_b',
    '选项C': 'option_c',
    '选项D': 'option_d',
    '选项E': 'option_e',
    '正确答案': 'correct_answer',
    '解析': 'explanation'
};

// Excel列名对应关系（支持多种命名）
const COLUMN_ALIASES = {
    'subject': ['科目', '科目名称', 'subject', 'subject_name'],
    'chapter': ['章节', '章节名称', 'chapter', 'chapter_name'],
    'type': ['题目类型', '类型', 'type', 'question_type'],
    'difficulty': ['难度', 'difficulty', 'level'],
    'question': ['题目内容', '题目', '题干', 'question', 'content'],
    'option_a': ['选项A', 'A', 'option_a', 'choice_a'],
    'option_b': ['选项B', 'B', 'option_b', 'choice_b'],
    'option_c': ['选项C', 'C', 'option_c', 'choice_c'],
    'option_d': ['选项D', 'D', 'option_d', 'choice_d'],
    'option_e': ['选项E', 'E', 'option_e', 'choice_e'],
    'correct_answer': ['正确答案', '答案', 'correct_answer', 'answer', 'correct'],
    'explanation': ['解析', '答案解析', 'explanation', 'analysis']
};

// 查找字段对应的列索引
function findColumnIndex(headers, targetField) {
    const aliases = COLUMN_ALIASES[targetField];
    if (!aliases) return -1;
    
    for (let i = 0; i < headers.length; i++) {
        const header = String(headers[i]).trim();
        if (aliases.includes(header)) {
            return i;
        }
    }
    return -1;
}

// 读取Excel文件
function readExcelFile(filePath) {
    const XLSX = require('xlsx');
    
    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        return {
            headers: data[0] || [],
            rows: data.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== null && cell !== '')),
            sheetName
        };
    } catch (error) {
        console.error('读取Excel文件失败:', error.message);
        return null;
    }
}

// 转换Excel行为题目对象
function convertRowToQuestion(row, headers) {
    const getValue = (field) => {
        const colIndex = findColumnIndex(headers, field);
        if (colIndex === -1) return '';
        return row[colIndex] !== undefined ? String(row[colIndex] || '').trim() : '';
    };
    
    const question = {
        subject: getValue('subject'),
        chapter: getValue('chapter') || '',
        type: getValue('type') || '单选题',
        difficulty: parseInt(getValue('difficulty')) || 1,
        question: getValue('question'),
        option_a: getValue('option_a') || '',
        option_b: getValue('option_b') || '',
        option_c: getValue('option_c') || '',
        option_d: getValue('option_d') || '',
        option_e: getValue('option_e') || '',
        correct_answer: getValue('correct_answer'),
        explanation: getValue('explanation') || ''
    };
    
    // 清理题目内容
    question.question = question.question.replace(/^\d+[.、)）]\s*/, '').trim();
    
    // 处理多选题答案格式
    if (question.type.includes('多选')) {
        question.correct_answer = question.correct_answer.toUpperCase().replace(/[^A-E]/g, '');
    }
    
    // 处理单选题答案格式
    if (question.type.includes('单选') || question.type === '单选题') {
        question.correct_answer = question.correct_answer.toUpperCase().charAt(0);
    }
    
    return question;
}

// 验证题目数据
function validateQuestions(questions) {
    const errors = [];
    const validTypes = ['单选题', '多选题', '计算题', '简答题', '综合题', '判断题', '案例分析题'];
    
    questions.forEach((q, index) => {
        if (!q.subject) {
            errors.push(`第${index + 2}行: 缺少科目`);
        }
        if (!q.question) {
            errors.push(`第${index + 2}行: 缺少题目内容`);
        }
        if (!q.correct_answer) {
            errors.push(`第${index + 2}行: 缺少正确答案`);
        }
        if (q.type && !validTypes.includes(q.type) && !q.type.includes('选择')) {
            errors.push(`第${index + 2}行: 题目类型"${q.type}"可能无效`);
        }
    });
    
    return errors;
}

// 导入到data.json
function importToDataJson(questions) {
    const DATA_FILE = './data.json';
    let data = { questions: [], users: [], answer_records: [], exam_records: [] };
    
    try {
        // 读取现有数据
        if (fs.existsSync(DATA_FILE)) {
            const existingData = fs.readFileSync(DATA_FILE, 'utf8');
            data = JSON.parse(existingData);
        }
        
        // 生成新ID
        const startId = data.questions.length > 0 
            ? Math.max(...data.questions.map(q => q.id)) + 1 
            : 1;
        
        // 添加题目
        let addedCount = 0;
        let duplicateCount = 0;
        
        questions.forEach((q, index) => {
            // 检查是否重复（相同题目和科目）
            const isDuplicate = data.questions.some(existing => 
                existing.subject === q.subject && 
                existing.question === q.question
            );
            
            if (isDuplicate) {
                duplicateCount++;
            } else {
                q.id = startId + addedCount;
                data.questions.push(q);
                addedCount++;
            }
        });
        
        // 保存
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        
        return { added: addedCount, duplicate: duplicateCount };
    } catch (error) {
        throw error;
    }
}

// 统计题目信息
function getQuestionStats(questions) {
    const stats = {
        total: questions.length,
        byType: {},
        bySubject: {},
        byDifficulty: { 1: 0, 2: 0, 3: 0 }
    };
    
    questions.forEach(q => {
        // 按类型统计
        stats.byType[q.type] = (stats.byType[q.type] || 0) + 1;
        
        // 按科目统计
        stats.bySubject[q.subject] = (stats.bySubject[q.subject] || 0) + 1;
        
        // 按难度统计
        const diff = q.difficulty || 1;
        if (stats.byDifficulty[diff] !== undefined) {
            stats.byDifficulty[diff]++;
        }
    });
    
    return stats;
}

// 预览题目
function previewQuestions(questions, count = 3) {
    console.log(`\n=== 题目预览（前 ${Math.min(count, questions.length)} 道）===\n`);
    
    questions.slice(0, count).forEach((q, index) => {
        console.log(`【题目 ${index + 1}】`);
        console.log(`科目: ${q.subject} | 章节: ${q.chapter} | 类型: ${q.type} | 难度: ${'★'.repeat(q.difficulty)}`);
        console.log(`题目: ${q.question.substring(0, 60)}${q.question.length > 60 ? '...' : ''}`);
        if (q.option_a) console.log(`A: ${q.option_a.substring(0, 30)}...`);
        if (q.option_b) console.log(`B: ${q.option_b.substring(0, 30)}...`);
        console.log(`答案: ${q.correct_answer}`);
        console.log('');
    });
}

// 显示统计信息
function displayStats(stats) {
    console.log('\n=== 导入统计 ===');
    console.log(`总题目数: ${stats.total}`);
    
    console.log('\n按科目:');
    Object.entries(stats.bySubject).forEach(([subject, count]) => {
        console.log(`  ${subject}: ${count} 题`);
    });
    
    console.log('\n按类型:');
    Object.entries(stats.byType).forEach(([type, count]) => {
        console.log(`  ${type}: ${count} 题`);
    });
    
    console.log('\n按难度:');
    console.log(`  简单(★): ${stats.byDifficulty[1]} 题`);
    console.log(`  中等(★★): ${stats.byDifficulty[2]} 题`);
    console.log(`  困难(★★★): ${stats.byDifficulty[3]} 题`);
}

// 主函数
async function main() {
    console.log('========================================');
    console.log('   Excel批量导入工具 v1.0');
    console.log('   适用于CPA注册会计师题库系统');
    console.log('========================================\n');
    
    // 检查依赖
    if (!checkXlsxDependency()) {
        return;
    }
    
    // 查找Excel文件
    const possibleFiles = [
        './题目导入模板.xlsx',
        './题库.xlsx',
        './questions.xlsx',
        './import.xlsx',
        './data.xlsx'
    ];
    
    let excelFile = null;
    
    for (const file of possibleFiles) {
        if (fs.existsSync(file)) {
            excelFile = file;
            break;
        }
    }
    
    if (!excelFile) {
        console.log('⚠️  未找到Excel文件');
        console.log('\n请将Excel文件放入当前目录，支持以下文件名：');
        possibleFiles.forEach(f => console.log(`  - ${f}`));
        console.log('\n提示：您可以复制 题目导入模板.xlsx 并填写内容\n');
        return;
    }
    
    console.log(`✓ 找到Excel文件: ${excelFile}\n`);
    
    // 读取Excel
    const excelData = readExcelFile(excelFile);
    if (!excelData || excelData.rows.length === 0) {
        console.log('⚠️  Excel文件为空或格式错误');
        return;
    }
    
    console.log(`✓ 读取到 ${excelData.rows.length} 行数据\n`);
    
    // 转换为题目
    const questions = excelData.rows.map(row => convertRowToQuestion(row, excelData.headers));
    
    // 验证
    console.log('正在验证数据...');
    const errors = validateQuestions(questions);
    
    if (errors.length > 0) {
        console.log(`⚠️  发现 ${errors.length} 个问题（仍将继续导入）:`);
        errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
        if (errors.length > 10) {
            console.log(`  ... 还有 ${errors.length - 10} 个问题`);
        }
        console.log('');
    } else {
        console.log('✓ 数据验证通过\n');
    }
    
    // 显示统计
    const stats = getQuestionStats(questions);
    displayStats(stats);
    
    // 预览
    previewQuestions(questions);
    
    // 确认导入
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question(`\n确认导入 ${questions.length} 道题目？(y/n): `, async (answer) => {
        if (answer.toLowerCase() !== 'y') {
            console.log('已取消导入');
            rl.close();
            return;
        }
        
        console.log('\n正在导入...\n');
        
        try {
            const result = importToDataJson(questions);
            
            console.log('========================================');
            console.log('   导入完成！');
            console.log('========================================');
            console.log(`✓ 新增题目: ${result.added} 道`);
            if (result.duplicate > 0) {
                console.log(`⚠️  跳过重复: ${result.duplicate} 道`);
            }
            console.log('\n下一步操作：');
            console.log('1. 启动服务器: node server-simple.js');
            console.log('2. 访问系统: http://localhost:3000');
            console.log('3. 开始练习！\n');
        } catch (error) {
            console.error('导入失败:', error.message);
        }
        
        rl.close();
    });
}

// 导出函数供其他模块使用
module.exports = {
    readExcelFile,
    convertRowToQuestion,
    validateQuestions,
    importToDataJson,
    getQuestionStats
};

// 运行主函数
if (require.main === module) {
    main().catch(console.error);
}
