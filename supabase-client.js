/**
 * Supabase 数据库连接工具
 * 用于 CPA 题库系统
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase 配置 - 请替换为您自己的项目信息
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

let supabase = null;

// 初始化 Supabase 客户端
function initSupabase(url, key) {
    if (url && key && url !== 'YOUR_SUPABASE_URL') {
        supabase = createClient(url, key);
        console.log('✅ Supabase 连接成功');
        return true;
    }
    return false;
}

// 检查是否已连接
function isConnected() {
    return supabase !== null;
}

// ============ 用户相关 ============

// 获取当前用户
async function getCurrentUser() {
    if (!supabase) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
}

// 获取用户会话
async function getSession() {
    if (!supabase) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) return null;
    return session;
}

// 注册用户
async function signUp(email, password, username) {
    if (!supabase) return { error: 'Supabase 未连接' };
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username }
        }
    });
    
    return { data, error };
}

// 登录
async function signIn(email, password) {
    if (!supabase) return { error: 'Supabase 未连接' };
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    return { data, error };
}

// 退出登录
async function signOut() {
    if (!supabase) return { error: 'Supabase 未连接' };
    const { error } = await supabase.auth.signOut();
    return { error };
}

// 获取用户资料
async function getUserProfile(userId) {
    if (!supabase) return { data: null, error: 'Supabase 未连接' };
    
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    return { data, error };
}

// ============ 题目相关 ============

// 获取所有科目
async function getSubjects() {
    if (!supabase) return { data: [], error: 'Supabase 未连接' };
    
    const { data, error } = await supabase
        .from('questions')
        .select('subject');
    
    if (error) return { data: [], error };
    
    const subjects = [...new Set(data.map(q => q.subject))];
    return { data: subjects, error };
}

// 获取章节列表
async function getChapters(subject) {
    if (!supabase) return { data: [], error: 'Supabase 未连接' };
    
    const { data, error } = await supabase
        .from('questions')
        .select('chapter')
        .eq('subject', subject);
    
    if (error) return { data: [], error };
    
    const chapters = [...new Set(data.map(q => q.chapter))];
    return { data: chapters, error };
}

// 获取题目列表（支持筛选）
async function getQuestions({ subject, chapter, type, difficulty, limit, offset } = {}) {
    if (!supabase) return { data: [], error: 'Supabase 未连接' };
    
    let query = supabase.from('questions').select('*');
    
    if (subject) query = query.eq('subject', subject);
    if (chapter) query = query.eq('chapter', chapter);
    if (type) query = query.eq('type', type);
    if (difficulty) query = query.eq('difficulty', difficulty);
    
    query = query.range(offset || 0, (limit ? (offset || 0) + limit - 1 : 1000));
    
    const { data, error } = await query;
    return { data: data || [], error };
}

// 获取单题详情
async function getQuestion(id) {
    if (!supabase) return { data: null, error: 'Supabase 未连接' };
    
    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single();
    
    return { data, error };
}

// ============ 答题记录相关 ============

// 提交答题记录
async function submitAnswer(userId, questionId, userAnswer, isCorrect) {
    if (!supabase) return { error: 'Supabase 未连接' };
    
    const { data, error } = await supabase
        .from('answer_records')
        .insert({
            user_id: userId,
            question_id: questionId,
            user_answer: userAnswer,
            is_correct: isCorrect
        });
    
    return { data, error };
}

// 获取用户答题统计
async function getUserStats(userId) {
    if (!supabase) return { data: null, error: 'Supabase 未连接' };
    
    // 总答题数
    const { count: total } = await supabase
        .from('answer_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
    
    // 正确数
    const { count: correct } = await supabase
        .from('answer_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_correct', true);
    
    // 错题列表
    const { data: wrongQuestions } = await supabase
        .from('answer_records')
        .select('question_id')
        .eq('user_id', userId)
        .eq('is_correct', false);
    
    const wrongIds = [...new Set(wrongQuestions?.map(w => w.question_id) || [])];
    
    return {
        data: {
            total: total || 0,
            correct: correct || 0,
            accuracy: total > 0 ? ((correct / total) * 100).toFixed(2) : 0,
            wrong_count: wrongIds.length
        },
        error: null
    };
}

// 获取用户错题本
async function getWrongQuestions(userId) {
    if (!supabase) return { data: [], error: 'Supabase 未连接' };
    
    // 获取用户所有答错的题目ID
    const { data: records } = await supabase
        .from('answer_records')
        .select('question_id')
        .eq('user_id', userId)
        .eq('is_correct', false);
    
    if (!records || records.length === 0) {
        return { data: [], error: null };
    }
    
    const wrongIds = [...new Set(records.map(r => r.question_id))];
    
    const { data: questions, error } = await supabase
        .from('questions')
        .select('*')
        .in('id', wrongIds);
    
    return { data: questions || [], error };
}

// ============ 收藏相关 ============

// 收藏/取消收藏题目
async function toggleFavorite(userId, questionId, isWrong = false) {
    if (!supabase) return { error: 'Supabase 未连接' };
    
    // 检查是否已收藏
    const { data: existing } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('question_id', questionId)
        .single();
    
    if (existing) {
        // 取消收藏
        const { error } = await supabase
            .from('user_favorites')
            .delete()
            .eq('id', existing.id);
        return { action: 'removed', error };
    } else {
        // 添加收藏
        const { error } = await supabase
            .from('user_favorites')
            .insert({
                user_id: userId,
                question_id: questionId,
                is_wrong: isWrong
            });
        return { action: 'added', error };
    }
}

// 获取用户收藏
async function getFavorites(userId) {
    if (!supabase) return { data: [], error: 'Supabase 未连接' };
    
    const { data, error } = await supabase
        .from('user_favorites')
        .select('question_id')
        .eq('user_id', userId);
    
    if (error) return { data: [], error };
    
    const ids = data.map(f => f.question_id);
    if (ids.length === 0) return { data: [], error };
    
    const { data: questions, error: qError } = await supabase
        .from('questions')
        .select('*')
        .in('id', ids);
    
    return { data: questions || [], error: qError };
}

module.exports = {
    initSupabase,
    isConnected,
    getCurrentUser,
    getSession,
    signUp,
    signIn,
    signOut,
    getUserProfile,
    getSubjects,
    getChapters,
    getQuestions,
    getQuestion,
    submitAnswer,
    getUserStats,
    getWrongQuestions,
    toggleFavorite,
    getFavorites
};
