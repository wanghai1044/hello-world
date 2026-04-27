const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = './data.json';

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// 读取数据
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('读取数据失败:', e);
    }
    
    // 返回默认数据
    return {
        questions: [
            {
                id: 1,
                subject: '会计',
                chapter: '第一章 总论',
                type: '单选题',
                difficulty: 1,
                question: '下列关于会计基本假设的表述中，正确的是？',
                option_a: '会计主体确定了会计核算的空间范围',
                option_b: '持续经营明确了会计核算的时间范围',
                option_c: '会计分期是持续经营的前提',
                option_d: '货币计量为会计核算提供了必要手段',
                correct_answer: 'A',
                explanation: '会计主体确定了会计核算的空间范围，持续经营明确了会计核算的时间范围，会计分期是持续经营的补充，货币计量为会计核算提供了必要手段。'
            },
            {
                id: 2,
                subject: '会计',
                chapter: '第一章 总论',
                type: '多选题',
                difficulty: 2,
                question: '下列各项中，属于会计信息质量要求的有？',
                option_a: '可靠性',
                option_b: '相关性',
                option_c: '可理解性',
                option_d: '可比性',
                option_e: '实质重于形式',
                correct_answer: 'ABCDE',
                explanation: '会计信息质量要求包括：可靠性、相关性、可理解性、可比性、实质重于形式、重要性、谨慎性和及时性。'
            },
            {
                id: 3,
                subject: '审计',
                chapter: '第一章 审计概述',
                type: '单选题',
                difficulty: 1,
                question: '下列关于审计证据的表述中，正确的是？',
                option_a: '审计证据仅包括会计记录和其他信息',
                option_b: '审计证据的适当性影响其充分性',
                option_c: '审计证据的充分性影响其适当性',
                option_d: '审计证据的获取需要考虑成本效益原则',
                correct_answer: 'B',
                explanation: '审计证据的适当性会影响其充分性，但充分性不会影响适当性。'
            },
            {
                id: 4,
                subject: '财务成本管理',
                chapter: '第一章 财务管理基本原理',
                type: '计算题',
                difficulty: 3,
                question: '某公司拟进行一项投资，初始投资额为100万元，预计未来5年每年的现金净流量为30万元，假设折现率为10%，要求计算该项目的净现值（P/A，10%，5=3.7908）。',
                option_a: '13.72万元',
                option_b: '15.72万元',
                option_c: '16.72万元',
                option_d: '17.72万元',
                correct_answer: 'A',
                explanation: '净现值 = 30×(P/A,10%,5) - 100 = 30×3.7908 - 100 = 113.724 - 100 = 13.724万元'
            },
            {
                id: 5,
                subject: '税法',
                chapter: '第一章 税法总论',
                type: '单选题',
                difficulty: 1,
                question: '下列税种中，属于中央与地方共享税的是？',
                option_a: '消费税',
                option_b: '个人所得税',
                option_c: '关税',
                option_d: '土地增值税',
                correct_answer: 'B',
                explanation: '个人所得税属于中央与地方共享税，消费税和关税属于中央税，土地增值税属于地方税。'
            }
        ],
        users: [],
        answer_records: [],
        exam_records: []
    };
}

// 保存数据
function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('保存数据失败:', e);
        return false;
    }
}

// 初始化数据
let db = loadData();

// 生成新ID
function generateId(array) {
    if (array.length === 0) return 1;
    return Math.max(...array.map(item => item.id)) + 1;
}

// API路由

// 获取所有科目
app.get('/api/subjects', (req, res) => {
    const subjects = [...new Set(db.questions.map(q => q.subject))];
    res.json(subjects);
});

// 根据科目获取章节
app.get('/api/chapters/:subject', (req, res) => {
    const subject = req.params.subject;
    const chapters = [...new Set(db.questions.filter(q => q.subject === subject).map(q => q.chapter))];
    res.json(chapters);
});

// 获取题目列表（支持筛选）
app.get('/api/questions', (req, res) => {
    const {subject, chapter, type, difficulty, limit, offset} = req.query;
    let questions = [...db.questions];

    if (subject) {
        questions = questions.filter(q => q.subject === subject);
    }
    if (chapter) {
        questions = questions.filter(q => q.chapter === chapter);
    }
    if (type) {
        questions = questions.filter(q => q.type === type);
    }
    if (difficulty) {
        questions = questions.filter(q => q.difficulty === parseInt(difficulty));
    }

    const total = questions.length;
    const start = parseInt(offset) || 0;
    const end = limit ? start + parseInt(limit) : total;
    
    questions = questions.slice(start, end);
    
    res.json(questions);
});

// 获取题目详情
app.get('/api/questions/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const question = db.questions.find(q => q.id === id);
    
    if (!question) {
        res.status(404).json({error: '题目不存在'});
    } else {
        res.json(question);
    }
});

// 添加题目
app.post('/api/questions', (req, res) => {
    const {subject, chapter, type, difficulty, question, option_a, option_b, 
           option_c, option_d, option_e, correct_answer, explanation} = req.body;

    if (!subject || !type || !question || !correct_answer) {
        return res.status(400).json({error: '缺少必要字段'});
    }

    const newQuestion = {
        id: generateId(db.questions),
        subject,
        chapter: chapter || '',
        type,
        difficulty: difficulty || 1,
        question,
        option_a: option_a || '',
        option_b: option_b || '',
        option_c: option_c || '',
        option_d: option_d || '',
        option_e: option_e || '',
        correct_answer,
        explanation: explanation || ''
    };

    db.questions.push(newQuestion);
    saveData(db);
    
    res.json({id: newQuestion.id, message: '题目添加成功'});
});

// 提交答题记录
app.post('/api/answer', (req, res) => {
    const {user_id, question_id, user_answer} = req.body;

    if (!question_id || !user_answer) {
        return res.status(400).json({error: '缺少必要字段'});
    }

    const question = db.questions.find(q => q.id === parseInt(question_id));
    if (!question) {
        return res.status(404).json({error: '题目不存在'});
    }

    const is_correct = user_answer.toUpperCase() === question.correct_answer.toUpperCase() ? 1 : 0;
    
    const record = {
        id: generateId(db.answer_records),
        user_id: user_id ? parseInt(user_id) : null,
        question_id: parseInt(question_id),
        user_answer,
        is_correct,
        answer_time: new Date().toISOString()
    };

    db.answer_records.push(record);
    saveData(db);
    
    res.json({
        record_id: record.id,
        is_correct,
        correct_answer: question.correct_answer
    });
});

// 获取答题统计
app.get('/api/statistics/:user_id', (req, res) => {
    const user_id = parseInt(req.params.user_id);
    
    const userRecords = db.answer_records.filter(r => r.user_id === user_id);
    const total_answered = userRecords.length;
    const correct_count = userRecords.filter(r => r.is_correct === 1).length;
    const accuracy = total_answered > 0 ? (correct_count * 100.0 / total_answered).toFixed(2) : 0;
    
    // 获取各科目正确率
    const subjectStats = [];
    const subjects = [...new Set(db.questions.map(q => q.subject))];
    
    subjects.forEach(subject => {
        const subjectQuestions = db.questions.filter(q => q.subject === subject);
        const subjectQuestionIds = subjectQuestions.map(q => q.id);
        const subjectRecords = userRecords.filter(r => subjectQuestionIds.includes(r.question_id));
        
        if (subjectRecords.length > 0) {
            const subjectCorrect = subjectRecords.filter(r => r.is_correct === 1).length;
            subjectStats.push({
                subject,
                total: subjectRecords.length,
                correct: subjectCorrect,
                accuracy: (subjectCorrect * 100.0 / subjectRecords.length).toFixed(2)
            });
        }
    });
    
    res.json({
        overall: {total_answered, correct_count, accuracy},
        by_subject: subjectStats
    });
});

// 获取错题本
app.get('/api/wrong-questions/:user_id', (req, res) => {
    const user_id = parseInt(req.params.user_id);
    
    const wrongRecords = db.answer_records.filter(r => r.user_id === user_id && r.is_correct === 0);
    const wrongQuestionIds = [...new Set(wrongRecords.map(r => r.question_id))];
    
    const wrongQuestions = db.questions.filter(q => wrongQuestionIds.includes(q.id));
    
    res.json(wrongQuestions);
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`题库系统访问地址: http://localhost:${PORT}`);
    console.log('使用简化版数据存储（JSON文件）');
});
