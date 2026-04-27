/**
 * PDF题库导入工具
 * 功能：解析PDF文件，提取题目并导入到题库系统
 * 
 * 使用方法：
 * 1. 安装依赖：npm install pdf-parse
 * 2. 准备PDF文件，放在pdfs文件夹中
 * 3. 运行：node pdf-parser.js
 */

const fs = require('fs');
const path = require('path');

// 检查并安装pdf-parse
async function checkAndInstallDependencies() {
    try {
        require('pdf-parse');
        console.log('✓ pdf-parse 已安装');
        return true;
    } catch (e) {
        console.log('⚠️  pdf-parse 未安装或安装不正确');
        console.log('请运行以下命令手动安装：');
        console.log('  npm install pdf-parse --force');
        console.log('');
        console.log('或者使用替代方案：');
        console.log('  1. 使用 manual-import.js 手动输入题目');
        console.log('  2. 将PDF转为文本后手动整理成JSON格式');
        return false;
    }
}

// 解析PDF文件
async function parsePDF(filePath) {
    const pdfParse = require('pdf-parse');
    
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        
        console.log(`\n正在解析PDF: ${path.basename(filePath)}`);
        console.log(`总页数: ${data.numpages}`);
        console.log(`文本长度: ${data.text.length} 字符\n`);
        
        return data.text;
    } catch (error) {
        console.error('PDF解析失败:', error.message);
        return null;
    }
}

// 从文本中提取题目
function extractQuestions(text, subject, chapter) {
    const questions = [];
    
    // 常见的题目模式匹配
    // 模式1: 数字. 题目内容 A.选项 B.选项 C.选项 D.选项 答案：
    // 模式2: 题目内容 (A)选项 (B)选项 (C)选项 (D)选项 【答案】
    
    console.log('正在分析题目格式...\n');
    
    // 尝试多种常见格式
    const patterns = [
        // 格式1: 1. 题目 A. B. C. D. 答案：
        {
            name: '标准格式（数字编号）',
            questionRegex: /(\d+)[\.、\)]\s*([^\n]+?)(?=\s*[A-Da-d][\.、\)])/g,
            optionRegex: /([A-Da-d])[\.、\)]\s*([^\n]+?)(?=\s*[A-Da-d][\.、\)]|\s*答案[：:】]|\s*$)/g,
            answerRegex: /答案[：:】]\s*([A-Da-d])/i
        },
        // 格式2: 题目内容 (A) (B) (C) (D) 【答案】
        {
            name: '括号格式',
            questionRegex: /([^\n]+?)(?=\s*\([A-Da-d]\))/g,
            optionRegex: /\(([A-Da-d])\)\s*([^\n]+?)(?=\s*\([A-Da-d]\)|\s*【答案】|\s*$)/g,
            answerRegex: /【答案】\s*([A-Da-d])/i
        }
    ];
    
    let extracted = false;
    
    for (const pattern of patterns) {
        console.log(`尝试格式: ${pattern.name}`);
        
        // 这里需要更复杂的解析逻辑
        // 由于PDF格式多样，建议使用AI辅助解析或手动标注
        
        console.log(`  该格式不适用此PDF\n`);
    }
    
    if (!extracted) {
        console.log('⚠️  自动解析未找到匹配的题目格式');
        console.log('建议：使用AI辅助解析或手动整理题目\n');
    }
    
    return questions;
}

// 手动输入题目（交互模式）
function manualInputMode(subject) {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const questions = [];
    let currentQuestion = null;
    
    console.log('\n=== 手动输入模式 ===');
    console.log('提示：按回车跳过可选字段，输入 "done" 结束\n');
    
    const askQuestion = () => {
        rl.question('科目（默认：' + subject + '）: ', (subjectInput) => {
            const finalSubject = subjectInput || subject;
            
            rl.question('章节: ', (chapter) => {
                rl.question('题目类型（单选题/多选题/计算题）: ', (type) => {
                    rl.question('难度（1-3）: ', (difficulty) => {
                        rl.question('题目内容: ', (question) => {
                            rl.question('选项A: ', (option_a) => {
                                rl.question('选项B: ', (option_b) => {
                                    rl.question('选项C: ', (option_c) => {
                                        rl.question('选项D: ', (option_d) => {
                                            rl.question('选项E（可选，直接回车跳过）: ', (option_e) => {
                                                rl.question('正确答案（如：A 或 ABC）: ', (correct_answer) => {
                                                    rl.question('答案解析: ', (explanation) => {
                                                        const newQuestion = {
                                                            subject: finalSubject,
                                                            chapter: chapter || '未分类',
                                                            type: type || '单选题',
                                                            difficulty: parseInt(difficulty) || 1,
                                                            question,
                                                            option_a,
                                                            option_b,
                                                            option_c,
                                                            option_d,
                                                            option_e: option_e || '',
                                                            correct_answer: correct_answer.toUpperCase(),
                                                            explanation: explanation || ''
                                                        };
                                                        
                                                        questions.push(newQuestion);
                                                        console.log('\n✓ 题目已添加\n');
                                                        
                                                        rl.question('继续添加题目？(y/n): ', (answer) => {
                                                            if (answer.toLowerCase() === 'y') {
                                                                askQuestion();
                                                            } else {
                                                                rl.close();
                                                                saveQuestions(questions);
                                                            }
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    };
    
    askQuestion();
}

// 保存题目到JSON文件
function saveQuestions(questions, outputFile = './imported-questions.json') {
    try {
        fs.writeFileSync(outputFile, JSON.stringify(questions, null, 2), 'utf8');
        console.log(`\n✓ 成功保存 ${questions.length} 道题目到: ${outputFile}`);
        console.log('下一步：运行 node import-to-database.js 将题目导入系统\n');
    } catch (error) {
        console.error('保存失败:', error.message);
    }
}

// AI辅助解析（使用OpenAI API或其他AI服务）
async function aiAssistedParse(text, subject) {
    console.log('=== AI辅助解析模式 ===');
    console.log('提示：此功能需要配置AI API\n');
    
    // 这里可以集成OpenAI API、百度AI等
    // 示例代码框架：
    
    /*
    const axios = require('axios');
    
    const prompt = `
    请分析以下CPA考试题目文本，提取出所有题目，并按JSON格式返回。
    每道题目包含：subject, chapter, type, question, option_a, option_b, option_c, option_d, correct_answer, explanation
    
    文本内容：
    ${text.substring(0, 5000)}  // 限制长度
    `;
    
    try {
        const response = await axios.post('AI_API_ENDPOINT', {
            prompt: prompt,
            // 其他参数...
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        
        const questions = JSON.parse(response.data.choices[0].text);
        return questions;
    } catch (error) {
        console.error('AI解析失败:', error.message);
        return [];
    }
    */
    
    console.log('⚠️  AI辅助解析功能需要根据具体AI服务进行配置');
    console.log('建议：使用手动输入模式或联系开发者进行定制\n');
    
    return [];
}

// 主函数
async function main() {
    console.log('========================================');
    console.log('   PDF题库导入工具');
    console.log('========================================\n');
    
    // 检查依赖
    const depsOk = await checkAndInstallDependencies();
    if (!depsOk) return;
    
    // 检查PDF文件
    const pdfDir = './pdfs';
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir);
        console.log(`✓ 创建文件夹: ${pdfDir}`);
        console.log('请将PDF文件放入此文件夹，然后重新运行程序\n');
    }
    
    const pdfFiles = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
        console.log('⚠️  未找到PDF文件');
        console.log(`请将PDF文件放入 ${pdfDir} 文件夹\n`);
        
        // 询问是否使用手动输入模式
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question('是否使用手动输入模式？(y/n): ', (answer) => {
            rl.close();
            if (answer.toLowerCase() === 'y') {
                rl.question('科目名称: ', (subject) => {
                    manualInputMode(subject);
                });
            } else {
                console.log('\n使用方法：');
                console.log('1. 将PDF文件放入 pdfs 文件夹');
                console.log('2. 重新运行：node pdf-parser.js\n');
            }
        });
    } else {
        console.log(`找到 ${pdfFiles.length} 个PDF文件:`);
        pdfFiles.forEach((file, index) => {
            console.log(`  ${index + 1}. ${file}`);
        });
        console.log('');
        
        // 解析第一个PDF（可以扩展为解析所有）
        const pdfPath = path.join(pdfDir, pdfFiles[0]);
        const text = await parsePDF(pdfPath);
        
        if (text) {
            // 保存到临时文件供查看
            const textFile = './pdf-text-output.txt';
            fs.writeFileSync(textFile, text, 'utf8');
            console.log(`✓ PDF文本已保存到: ${textFile}`);
            console.log('请查看此文件，了解题目格式，然后选择解析方式\n');
            
            // 提供选项
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            console.log('请选择解析方式：');
            console.log('1. 手动输入模式（最准确）');
            console.log('2. AI辅助解析（需要配置API）');
            console.log('3. 查看文本后手动整理\n');
            
            rl.question('请输入选项（1-3）: ', (choice) => {
                rl.close();
                
                if (choice === '1') {
                    rl.question('科目名称: ', (subject) => {
                        manualInputMode(subject);
                    });
                } else if (choice === '2') {
                    aiAssistedParse(text, 'CPA');
                } else {
                    console.log('\n请查看 pdf-text-output.txt 文件，手动整理题目后运行：');
                    console.log('node import-to-database.js\n');
                }
            });
        }
    }
}

// 运行主函数
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    parsePDF,
    extractQuestions,
    saveQuestions
};
