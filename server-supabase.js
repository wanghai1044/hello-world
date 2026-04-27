/**
 * CPA题库系统 - Supabase版本
 * 支持多用户登录和答题记录
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase 配置
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mpcmygbgyqraldqwchlv.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_zdR8-QosMQ0ekT3miZEi8g_UUjtjaHK';

// 创建 Supabase 客户端
let supabase = null;

function initSupabase() {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase 连接成功');
        return true;
    } catch (error) {
        console.error('Supabase 初始化失败:', error.message);
        return false;
    }
}

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// 初始化 Supabase
initSupabase();

// 备用数据（当 Supabase 不可用时）
const fallbackData = {
    questions: [
        { id: 1, subject: '会计', chapter: '第一章 总论', type: '单选题', difficulty: 1, question: '下列关于会计基本假设的表述中，正确的是？', option_a: '会计主体确定了会计核算的空间范围', option_b: '持续经营明确了会计核算的时间范围', option_c: '会计分期是持续经营的前提', option_d: '货币计量为会计核算提供了必要手段', correct_answer: 'A', explanation: '会计主体确定了会计核算的空间范围' },
        { id: 2, subject: '会计', chapter: '第一章 总论', type: '多选题', difficulty: 2, question: '下列各项中，属于会计信息质量要求的有？', option_a: '可靠性', option_b: '相关性', option_c: '可理解性', option_d: '可比性', option_e: '实质重于形式', correct_answer: 'ABCD', explanation: '会计信息质量要求包括：可靠性、相关性、可理解性、可比性等' },
        { id: 3, subject: '审计', chapter: '第一章 审计概述', type: '单选题', difficulty: 1, question: '下列关于审计证据的表述中，正确的是？', option_a: '审计证据仅包括会计记录', option_b: '审计证据的适当性影响其充分性', option_c: '审计证据的充分性影响其适当性', option_d: '审计证据的获取需要考虑成本效益原则', correct_answer: 'B', explanation: '审计证据的适当性会影响其充分性' },
        { id: 4, subject: '财务成本管理', chapter: '第一章 财务管理基本原理', type: '计算题', difficulty: 3, question: '某公司初始投资额为100万元，预计未来5年每年的现金净流量为30万元，假设折现率为10%，要求计算该项目的净现值（P/A，10%，5=3.7908）。', option_a: '13.72万元', option_b: '15.72万元', option_c: '16.72万元', option_d: '17.72万元', correct_answer: 'A', explanation: '净现值 = 30×3.7908 - 100 = 13.724万元' },
        { id: 5, subject: '税法', chapter: '第一章 税法总论', type: '单选题', difficulty: 1, question: '下列税种中，属于中央与地方共享税的是？', option_a: '消费税', option_b: '个人所得税', option_c: '关税', option_d: '土地增值税', correct_answer: 'B', explanation: '个人所得税属于中央与地方共享税' }
    ],
    users: [],
    answer_records: []
};

// ============ API 路由 ============

// 获取所有科目
app.get('/api/subjects', async (req, res) => {
    if (supabase) {
        const { data, error } = await supabase.from('questions').select('subject');
        if (!error) {
            const subjects = [...new Set(data.map(q => q.subject))];
            return res.json(subjects);
        }
    }
    // 备用数据
    const subjects = [...new Set(fallbackData.questions.map(q => q.subject))];
    res.json(subjects);
});

// 根据科目获取章节
app.get('/api/chapters/:subject', async (req, res) => {
    const { subject } = req.params;
    if (supabase) {
        const { data, error } = await supabase.from('questions').select('chapter').eq('subject', subject);
        if (!error) {
            const chapters = [...new Set(data.map(q => q.chapter))];
            return res.json(chapters);
        }
    }
    // 备用数据
    const chapters = [...new Set(fallbackData.questions.filter(q => q.subject === subject).map(q => q.chapter))];
    res.json(chapters);
});

// 获取题目列表
app.get('/api/questions', async (req, res) => {
    const { subject, chapter, type, difficulty, limit, offset } = req.query;
    
    if (supabase) {
        let query = supabase.from('questions').select('*');
        
        if (subject) query = query.eq('subject', subject);
        if (chapter) query = query.eq('chapter', chapter);
        if (type) query = query.eq('type', type);
        if (difficulty) query = query.eq('difficulty', parseInt(difficulty));
        
        const start = parseInt(offset) || 0;
        const end = limit ? start + parseInt(limit) - 1 : 1000;
        query = query.range(start, end);
        
        const { data, error } = await query;
        if (!error) return res.json(data || []);
    }
    
    // 备用数据
    let questions = [...fallbackData.questions];
    if (subject) questions = questions.filter(q => q.subject === subject);
    if (chapter) questions = questions.filter(q => q.chapter === chapter);
    res.json(questions);
});

// 获取题目详情
app.get('/api/questions/:id', async (req, res) => {
    const { id } = req.params;
    
    if (supabase) {
        const { data, error } = await supabase.from('questions').select('*').eq('id', parseInt(id)).single();
        if (!error) return res.json(data);
    }
    
    // 备用数据
    const question = fallbackData.questions.find(q => q.id === parseInt(id));
    if (question) return res.json(question);
    res.status(404).json({ error: '题目不存在' });
});

// 提交答题记录
app.post('/api/answer', async (req, res) => {
    const { user_id, question_id, user_answer } = req.body;
    
    if (!question_id || !user_answer) {
        return res.status(400).json({ error: '缺少必要字段' });
    }
    
    // 获取题目正确答案
    let correctAnswer = '';
    if (supabase) {
        const { data } = await supabase.from('questions').select('correct_answer').eq('id', parseInt(question_id)).single();
        if (data) correctAnswer = data.correct_answer;
    } else {
        const q = fallbackData.questions.find(q => q.id === parseInt(question_id));
        if (q) correctAnswer = q.correct_answer;
    }
    
    const is_correct = user_answer.toUpperCase() === correctAnswer.toUpperCase();
    
    // 保存答题记录
    if (supabase && user_id) {
        await supabase.from('answer_records').insert({
            user_id: user_id,
            question_id: parseInt(question_id),
            user_answer: user_answer,
            is_correct: is_correct
        });
    }
    
    res.json({
        is_correct,
        correct_answer: correctAnswer
    });
});

// 获取用户答题统计
app.get('/api/statistics/:user_id', async (req, res) => {
    const { user_id } = req.params;
    
    let stats = { overall: { total_answered: 0, correct_count: 0, accuracy: 0 }, by_subject: [] };
    
    if (supabase) {
        // 总答题数
        const { count: total } = await supabase.from('answer_records').select('*', { count: 'exact', head: true }).eq('user_id', user_id);
        
        // 正确数
        const { count: correct } = await supabase.from('answer_records').select('*', { count: 'exact', head: true }).eq('user_id', user_id).eq('is_correct', true);
        
        stats.overall = {
            total_answered: total || 0,
            correct_count: correct || 0,
            accuracy: total > 0 ? ((correct / total) * 100).toFixed(2) : 0
        };
    }
    
    res.json(stats);
});

// 获取错题本
app.get('/api/wrong-questions/:user_id', async (req, res) => {
    const { user_id } = req.params;
    
    if (!supabase) {
        return res.json([]);
    }
    
    // 获取用户所有答错的题目ID
    const { data: records } = await supabase
        .from('answer_records')
        .select('question_id')
        .eq('user_id', user_id)
        .eq('is_correct', false);
    
    if (!records || records.length === 0) {
        return res.json([]);
    }
    
    const wrongIds = [...new Set(records.map(r => r.question_id))];
    
    const { data: questions, error } = await supabase
        .from('questions')
        .select('*')
        .in('id', wrongIds);
    
    res.json(questions || []);
});

// ============ 启动服务器 ============

app.listen(PORT, '0.0.0.0', () => {
    console.log(`========================================`);
    console.log(`   CPA题库系统 (Supabase版)`);
    console.log(`========================================`);
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`Supabase: ${SUPABASE_URL}`);
    console.log(`========================================`);
});
