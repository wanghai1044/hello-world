/**
 * 题目导入工具
 * 功能：将JSON格式的题目导入到题库系统
 * 
 * 使用方法：
 * 1. 准备题目JSON文件（格式见下文）
 * 2. 运行：node import-to-database.js
 */

const fs = require('fs');
const path = require('path');

// 读取题目数据
function loadQuestionsFromFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`文件不存在: ${filePath}`);
            return null;
        }
        
        const data = fs.readFileSync(filePath, 'utf8');
        const questions = JSON.parse(data);
        
        console.log(`✓ 成功读取 ${questions.length} 道题目`);
        return questions;
    } catch (error) {
        console.error('读取文件失败:', error.message);
        return null;
    }
}

// 导入题目到系统（简化版 - JSON文件）
function importToJsonFile(questions, dataFile = './data.json') {
    try {
        let data = { questions: [], users: [], answer_records: [], exam_records: [] };
        
        // 读取现有数据
        if (fs.existsSync(dataFile)) {
            const existingData = fs.readFileSync(dataFile, 'utf8');
            data = JSON.parse(existingData);
        }
        
        // 生成新ID并添加题目
        const startId = data.questions.length > 0 
            ? Math.max(...data.questions.map(q => q.id)) + 1 
            : 1;
        
        questions.forEach((q, index) => {
            q.id = startId + index;
            data.questions.push(q);
        });
        
        // 保存数据
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
        
        console.log(`✓ 成功导入 ${questions.length} 道题目到 ${dataFile}`);
        console.log(`题目ID范围: ${startId} - ${startId + questions.length - 1}\n`);
        
        return true;
    } catch (error) {
        console.error('导入失败:', error.message);
        return false;
    }
}

// 导入题目到数据库（完整版 - SQLite）
function importToDatabase(questions, dbFile = './database.db') {
    const sqlite3 = require('sqlite3').verbose();
    
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbFile, (err) => {
            if (err) {
                console.error('数据库连接失败:', err.message);
                reject(err);
                return;
            }
            
            console.log('✓ 数据库连接成功');
            
            // 准备插入语句
            const stmt = db.prepare(`INSERT INTO questions 
                (subject, chapter, type, difficulty, question, option_a, option_b, option_c, option_d, option_e, correct_answer, explanation) 
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
            
            let successCount = 0;
            let errorCount = 0;
            
            questions.forEach(q => {
                stmt.run([
                    q.subject,
                    q.chapter || '',
                    q.type || '单选题',
                    q.difficulty || 1,
                    q.question,
                    q.option_a || '',
                    q.option_b || '',
                    q.option_c || '',
                    q.option_d || '',
                    q.option_e || '',
                    q.correct_answer,
                    q.explanation || ''
                ], function(err) {
                    if (err) {
                        console.error('插入失败:', err.message);
                        errorCount++;
                    } else {
                        successCount++;
                    }
                });
            });
            
            stmt.finalize();
            
            db.close((err) => {
                if (err) {
                    console.error('关闭数据库失败:', err.message);
                    reject(err);
                } else {
                    console.log(`✓ 导入完成: 成功 ${successCount} 道，失败 ${errorCount} 道`);
                    resolve({ success: successCount, error: errorCount });
                }
            });
        });
    });
}

// 题目格式验证
function validateQuestions(questions) {
    const errors = [];
    const validTypes = ['单选题', '多选题', '计算题', '简答题', '综合题'];
    
    questions.forEach((q, index) => {
        if (!q.subject) {
            errors.push(`题目 ${index + 1}: 缺少科目(subject)`);
        }
        if (!q.question) {
            errors.push(`题目 ${index + 1}: 缺少题目内容(question)`);
        }
        if (!q.correct_answer) {
            errors.push(`题目 ${index + 1}: 缺少正确答案(correct_answer)`);
        }
        if (q.type && !validTypes.includes(q.type)) {
            errors.push(`题目 ${index + 1}: 题目类型(type)无效，应为: ${validTypes.join(', ')}`);
        }
    });
    
    return errors;
}

// 显示题目预览
function previewQuestions(questions, count = 3) {
    console.log(`\n=== 题目预览（前 ${Math.min(count, questions.length)} 道）===\n`);
    
    questions.slice(0, count).forEach((q, index) => {
        console.log(`【题目 ${index + 1}】`);
        console.log(`科目: ${q.subject}`);
        console.log(`章节: ${q.chapter || '未分类'}`);
        console.log(`类型: ${q.type || '单选题'}`);
        console.log(`难度: ${q.difficulty || 1}`);
        console.log(`题目: ${q.question}`);
        console.log(`选项: A.${q.option_a || ''}  B.${q.option_b || ''}`);
        if (q.option_c) console.log(`      C.${q.option_c}  D.${q.option_d || ''}`);
        if (q.option_e) console.log(`      E.${q.option_e}`);
        console.log(`答案: ${q.correct_answer}`);
        if (q.explanation) console.log(`解析: ${q.explanation}`);
        console.log('');
    });
}

// 主函数
async function main() {
    console.log('========================================');
    console.log('   题目导入工具');
    console.log('========================================\n');
    
    // 查找题目文件
    const possibleFiles = [
        './imported-questions.json',
        './questions.json',
        './data-to-import.json'
    ];
    
    let questionsFile = null;
    for (const file of possibleFiles) {
        if (fs.existsSync(file)) {
            questionsFile = file;
            break;
        }
    }
    
    if (!questionsFile) {
        console.log('⚠️  未找到题目文件');
        console.log('支持的文件名：');
        possibleFiles.forEach(f => console.log(`  - ${f}`));
        console.log('\n请先准备题目JSON文件，或使用 pdf-parser.js 创建题目\n');
        
        // 创建示例文件
        console.log('是否创建示例题目文件？(y/n): ');
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question('', (answer) => {
            if (answer.toLowerCase() === 'y') {
                const sampleQuestions = [
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
                    }
                ];
                
                fs.writeFileSync('./imported-questions.json', JSON.stringify(sampleQuestions, null, 2), 'utf8');
                console.log('\n✓ 已创建示例文件: ./imported-questions.json');
                console.log('请编辑此文件，添加更多题目，然后重新运行导入工具\n');
            }
            rl.close();
        });
        
        return;
    }
    
    console.log(`找到题目文件: ${questionsFile}\n`);
    
    // 读取题目
    const questions = loadQuestionsFromFile(questionsFile);
    if (!questions || questions.length === 0) {
        console.log('⚠️  文件中没有题目数据');
        return;
    }
    
    // 验证题目格式
    console.log('正在验证题目格式...');
    const errors = validateQuestions(questions);
    
    if (errors.length > 0) {
        console.log(`⚠️  发现 ${errors.length} 个格式问题:`);
        errors.forEach(err => console.log(`  - ${err}`));
        console.log('');
    } else {
        console.log('✓ 题目格式验证通过\n');
    }
    
    // 预览题目
    previewQuestions(questions);
    
    // 确认导入
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question('确认导入这些题目？(y/n): ', async (answer) => {
        if (answer.toLowerCase() !== 'y') {
            console.log('已取消导入');
            rl.close();
            return;
        }
        
        console.log('\n正在导入题目...\n');
        
        // 选择导入方式
        rl.question('选择导入方式：1. JSON文件（简化版） 2. SQLite数据库（完整版）\n请输入选项（1或2）: ', async (choice) => {
            if (choice === '1') {
                // 导入到JSON文件
                importToJsonFile(questions);
            } else if (choice === '2') {
                // 导入到数据库
                try {
                    await importToDatabase(questions);
                } catch (error) {
                    console.error('数据库导入失败:', error.message);
                }
            } else {
                console.log('无效选项，默认使用JSON文件方式');
                importToJsonFile(questions);
            }
            
            rl.close();
            
            console.log('\n========================================');
            console.log('导入完成！');
            console.log('========================================');
            console.log('下一步：');
            console.log('1. 启动服务器：node server-simple.js');
            console.log('2. 访问系统：http://localhost:3000');
            console.log('3. 开始练习！\n');
        });
    });
}

// 运行主函数
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    loadQuestionsFromFile,
    importToJsonFile,
    importToDatabase,
    validateQuestions
};
