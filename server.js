const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// 数据库初始化
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('数据库连接失败:', err);
    } else {
        console.log('数据库连接成功');
        initDatabase();
    }
});

// 初始化数据库表
function initDatabase() {
    db.serialize(() => {
        // 题目表
        db.run(`CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            chapter TEXT,
            type TEXT NOT NULL,
            difficulty INTEGER,
            question TEXT NOT NULL,
            option_a TEXT,
            option_b TEXT,
            option_c TEXT,
            option_d TEXT,
            option_e TEXT,
            correct_answer TEXT NOT NULL,
            explanation TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 用户表
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 答题记录表
        db.run(`CREATE TABLE IF NOT EXISTS answer_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            question_id INTEGER,
            user_answer TEXT,
            is_correct INTEGER,
            answer_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (question_id) REFERENCES questions(id)
        )`);

        // 考试记录表
        db.run(`CREATE TABLE IF NOT EXISTS exam_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            subject TEXT,
            total_questions INTEGER,
            correct_count INTEGER,
            score REAL,
            start_time DATETIME,
            end_time DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`, () => {
            console.log('数据库表初始化完成');
            insertSampleData();
        });
    });
}

// 插入示例数据
function insertSampleData() {
    db.get("SELECT COUNT(*) as count FROM questions", (err, row) => {
        if (row.count === 0) {
            const sampleQuestions = [
                {
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
                    explanation: '审计证据的适当性会影响其充分性，但充分性不会影响适当性。审计证据的获取需要考虑成本效益原则，但不能以提高效率为由减少必要的审计程序。'
                },
                {
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
            ];

            const stmt = db.prepare(`INSERT INTO questions 
                (subject, chapter, type, difficulty, question, option_a, option_b, option_c, option_d, option_e, correct_answer, explanation) 
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);

            sampleQuestions.forEach(q => {
                stmt.run([q.subject, q.chapter, q.type, q.difficulty, q.question, 
                    q.option_a, q.option_b, q.option_c, q.option_d, q.option_e, 
                    q.correct_answer, q.explanation]);
            });

            stmt.finalize();
            console.log('示例数据插入完成');
        }
    });
}

// API路由

// 获取所有科目
app.get('/api/subjects', (req, res) => {
    db.all("SELECT DISTINCT subject FROM questions", (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
        } else {
            res.json(rows.map(r => r.subject));
        }
    });
});

// 根据科目获取章节
app.get('/api/chapters/:subject', (req, res) => {
    const subject = req.params.subject;
    db.all("SELECT DISTINCT chapter FROM questions WHERE subject = ?", [subject], (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
        } else {
            res.json(rows.map(r => r.chapter));
        }
    });
});

// 获取题目列表（支持筛选）
app.get('/api/questions', (req, res) => {
    const {subject, chapter, type, difficulty, limit, offset} = req.query;
    let sql = "SELECT * FROM questions WHERE 1=1";
    const params = [];

    if (subject) {
        sql += " AND subject = ?";
        params.push(subject);
    }
    if (chapter) {
        sql += " AND chapter = ?";
        params.push(chapter);
    }
    if (type) {
        sql += " AND type = ?";
        params.push(type);
    }
    if (difficulty) {
        sql += " AND difficulty = ?";
        params.push(difficulty);
    }

    sql += " ORDER BY id";
    
    if (limit) {
        sql += " LIMIT ?";
        params.push(parseInt(limit));
    }
    if (offset) {
        sql += " OFFSET ?";
        params.push(parseInt(offset));
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
        } else {
            res.json(rows);
        }
    });
});

// 获取题目详情
app.get('/api/questions/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM questions WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({error: err.message});
        } else if (!row) {
            res.status(404).json({error: '题目不存在'});
        } else {
            res.json(row);
        }
    });
});

// 添加题目
app.post('/api/questions', (req, res) => {
    const {subject, chapter, type, difficulty, question, option_a, option_b, 
           option_c, option_d, option_e, correct_answer, explanation} = req.body;

    if (!subject || !type || !question || !correct_answer) {
        return res.status(400).json({error: '缺少必要字段'});
    }

    db.run(`INSERT INTO questions 
        (subject, chapter, type, difficulty, question, option_a, option_b, option_c, option_d, option_e, correct_answer, explanation) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [subject, chapter, type, difficulty, question, option_a, option_b, option_c, option_d, option_e, correct_answer, explanation],
        function(err) {
            if (err) {
                res.status(500).json({error: err.message});
            } else {
                res.json({id: this.lastID, message: '题目添加成功'});
            }
        }
    );
});

// 提交答题记录
app.post('/api/answer', (req, res) => {
    const {user_id, question_id, user_answer} = req.body;

    if (!question_id || !user_answer) {
        return res.status(400).json({error: '缺少必要字段'});
    }

    // 获取正确答案
    db.get("SELECT correct_answer FROM questions WHERE id = ?", [question_id], (err, row) => {
        if (err) {
            res.status(500).json({error: err.message});
        } else if (!row) {
            res.status(404).json({error: '题目不存在'});
        } else {
            const is_correct = user_answer.toUpperCase() === row.correct_answer.toUpperCase() ? 1 : 0;
            
            db.run(`INSERT INTO answer_records (user_id, question_id, user_answer, is_correct) 
                    VALUES (?,?,?,?)`,
                [user_id || null, question_id, user_answer, is_correct],
                function(err) {
                    if (err) {
                        res.status(500).json({error: err.message});
                    } else {
                        res.json({
                            record_id: this.lastID,
                            is_correct: is_correct,
                            correct_answer: row.correct_answer
                        });
                    }
                }
            );
        }
    });
});

// 获取答题统计
app.get('/api/statistics/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    
    db.get(`SELECT 
        COUNT(*) as total_answered,
        SUM(is_correct) as correct_count,
        ROUND(SUM(is_correct) * 100.0 / COUNT(*), 2) as accuracy
        FROM answer_records 
        WHERE user_id = ?`, [user_id], (err, stats) => {
        if (err) {
            res.status(500).json({error: err.message});
        } else {
            // 获取各科目正确率
            db.all(`SELECT 
                q.subject,
                COUNT(*) as total,
                SUM(ar.is_correct) as correct,
                ROUND(SUM(ar.is_correct) * 100.0 / COUNT(*), 2) as accuracy
                FROM answer_records ar
                JOIN questions q ON ar.question_id = q.id
                WHERE ar.user_id = ?
                GROUP BY q.subject`, [user_id], (err, subjectStats) => {
                if (err) {
                    res.status(500).json({error: err.message});
                } else {
                    res.json({
                        overall: stats,
                        by_subject: subjectStats
                    });
                }
            });
        }
    });
});

// 获取错题本
app.get('/api/wrong-questions/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    
    db.all(`SELECT DISTINCT q.* 
            FROM questions q
            JOIN answer_records ar ON q.id = ar.question_id
            WHERE ar.user_id = ? AND ar.is_correct = 0
            ORDER BY ar.answer_time DESC`, [user_id], (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
        } else {
            res.json(rows);
        }
    });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`题库系统访问地址: http://localhost:${PORT}`);
});
