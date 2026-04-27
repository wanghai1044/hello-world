// 全局变量
let currentQuestions = [];
let currentIndex = 0;
let userAnswers = [];
let userId = localStorage.getItem('userId') || 1;
let isLoggedIn = false;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkUserStatus();
    
    // 如果从首页跳转过来，获取科目参数
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    if (subject && window.location.pathname.includes('practice')) {
        loadQuestions(subject);
    }
});

// 检查用户登录状态
function checkUserStatus() {
    const token = localStorage.getItem('sb_access_token');
    const email = localStorage.getItem('user_email');
    
    if (token && email) {
        isLoggedIn = true;
        userId = token; // 使用token作为用户标识
        
        // 更新UI
        const userInfo = document.getElementById('user-info');
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (userInfo) {
            userInfo.textContent = email;
            userInfo.style.display = 'inline';
        }
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline';
    } else {
        isLoggedIn = false;
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        if (loginBtn) loginBtn.style.display = 'inline';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// 退出登录
function logout() {
    localStorage.removeItem('sb_access_token');
    localStorage.removeItem('sb_refresh_token');
    localStorage.removeItem('user_email');
    isLoggedIn = false;
    window.location.href = 'index.html';
}

// 获取带认证的请求头
function getAuthHeaders() {
    const token = localStorage.getItem('sb_access_token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

// 开始练习某个科目
function startPractice(subject) {
    window.location.href = `practice.html?subject=${encodeURIComponent(subject)}`;
}

// 加载题目
async function loadQuestions(subject, limit = 50) {
    try {
        let url = '/api/questions?';
        if (subject) {
            url += `subject=${encodeURIComponent(subject)}&`;
        }
        url += `limit=${limit}`;
        
        const response = await fetch(url);
        const questions = await response.json();
        
        if (questions.length === 0) {
            alert('该科目暂无题目，请先添加题目或选择其他科目');
            return;
        }
        
        currentQuestions = questions;
        currentIndex = 0;
        userAnswers = new Array(questions.length).fill(null);
        
        displayQuestion();
    } catch (error) {
        console.error('加载题目失败:', error);
        alert('加载题目失败，请检查服务器是否启动');
    }
}

// 显示题目
function displayQuestion() {
    if (currentIndex >= currentQuestions.length) {
        showResult();
        return;
    }
    
    const question = currentQuestions[currentIndex];
    const container = document.getElementById('question-container');
    
    if (!container) return;
    
    let optionsHtml = '';
    const options = [
        {key: 'A', value: question.option_a},
        {key: 'B', value: question.option_b},
        {key: 'C', value: question.option_c},
        {key: 'D', value: question.option_d}
    ];
    
    if (question.option_e) {
        options.push({key: 'E', value: question.option_e});
    }
    
    options.forEach(option => {
        if (option.value) {
            const isSelected = userAnswers[currentIndex] === option.key;
            optionsHtml += `
                <div class="option ${isSelected ? 'selected' : ''}" onclick="selectOption('${option.key}')">
                    <span class="option-label">${option.key}.</span>
                    <span class="option-text">${option.value}</span>
                </div>
            `;
        }
    });
    
    container.innerHTML = `
        <div class="question-card">
            <div class="question-header">
                <span class="question-type">${question.type}</span>
                <span class="question-number">第 ${currentIndex + 1} 题 / 共 ${currentQuestions.length} 题</span>
            </div>
            <div class="question-text">${question.question}</div>
            <div class="options">${optionsHtml}</div>
            ${question.explanation && userAnswers[currentIndex] ? `
                <div class="explanation">
                    <h4>答案解析</h4>
                    <p>正确答案: ${question.correct_answer}</p>
                    <p>${question.explanation}</p>
                </div>
            ` : ''}
        </div>
        <div class="controls">
            <button class="btn-control" onclick="prevQuestion()" ${currentIndex === 0 ? 'disabled' : ''}>上一题</button>
            ${currentIndex === currentQuestions.length - 1 ? 
                '<button class="btn-control" onclick="submitAll()">提交答案</button>' : 
                '<button class="btn-control" onclick="nextQuestion()">下一题</button>'}
        </div>
    `;
}

// 选择选项
function selectOption(key) {
    userAnswers[currentIndex] = key;
    
    // 提交答案到服务器
    submitAnswer(currentQuestions[currentIndex].id, key);
    
    // 重新显示题目以更新UI
    displayQuestion();
}

// 提交单个答案
async function submitAnswer(questionId, userAnswer) {
    try {
        await fetch('/api/answer', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: userId,
                question_id: questionId,
                user_answer: userAnswer
            })
        });
    } catch (error) {
        console.error('提交答案失败:', error);
    }
}

// 上一题
function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        displayQuestion();
    }
}

// 下一题
function nextQuestion() {
    if (currentIndex < currentQuestions.length - 1) {
        currentIndex++;
        displayQuestion();
    }
}

// 提交所有答案
function submitAll() {
    const correctCount = userAnswers.filter((answer, index) => {
        return answer === currentQuestions[index].correct_answer;
    }).length;
    
    const accuracy = (correctCount / currentQuestions.length * 100).toFixed(2);
    
    alert(`答题完成！\n正确: ${correctCount}题\n错误: ${currentQuestions.length - correctCount}题\n正确率: ${accuracy}%`);
    
    // 可以跳转到结果页面或统计页面
    window.location.href = 'statistics.html';
}

// 显示结果
function showResult() {
    const correctCount = userAnswers.filter((answer, index) => {
        return answer === currentQuestions[index].correct_answer;
    }).length;
    
    const container = document.getElementById('question-container');
    container.innerHTML = `
        <div class="stat-card">
            <h3>答题结果</h3>
            <div class="stat-item">
                <span>总题数</span>
                <span>${currentQuestions.length}</span>
            </div>
            <div class="stat-item">
                <span>正确题数</span>
                <span>${correctCount}</span>
            </div>
            <div class="stat-item">
                <span>错误题数</span>
                <span>${currentQuestions.length - correctCount}</span>
            </div>
            <div class="stat-item">
                <span>正确率</span>
                <span>${((correctCount / currentQuestions.length) * 100).toFixed(2)}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(correctCount / currentQuestions.length) * 100}%">
                    ${((correctCount / currentQuestions.length) * 100).toFixed(2)}%
                </div>
            </div>
            <div style="margin-top: 20px; text-align: center;">
                <button class="btn-primary" onclick="window.location.href='index.html'">返回首页</button>
                <button class="btn-secondary" onclick="window.location.href='wrong.html'" style="margin-left: 10px;">查看错题</button>
            </div>
        </div>
    `;
}

// 加载统计数据
async function loadStatistics() {
    try {
        const response = await fetch(`/api/statistics/${userId}`);
        const stats = await response.json();
        
        displayStatistics(stats);
    } catch (error) {
        console.error('加载统计数据失败:', error);
    }
}

// 显示统计数据
function displayStatistics(stats) {
    const container = document.getElementById('statistics-container');
    if (!container) return;
    
    let subjectStatsHtml = '';
    if (stats.by_subject && stats.by_subject.length > 0) {
        stats.by_subject.forEach(subject => {
            subjectStatsHtml += `
                <div class="stat-item">
                    <span>${subject.subject}</span>
                    <span>${subject.correct}/${subject.total} (${subject.accuracy}%)</span>
                </div>
            `;
        });
    }
    
    container.innerHTML = `
        <div class="stat-card">
            <h3>总体统计</h3>
            <div class="stat-item">
                <span>总答题数</span>
                <span>${stats.overall.total_answered || 0}</span>
            </div>
            <div class="stat-item">
                <span>正确题数</span>
                <span>${stats.overall.correct_count || 0}</span>
            </div>
            <div class="stat-item">
                <span>正确率</span>
                <span>${stats.overall.accuracy || 0}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${stats.overall.accuracy || 0}%">
                    ${stats.overall.accuracy || 0}%
                </div>
            </div>
        </div>
        
        <div class="stat-card">
            <h3>各科统计</h3>
            ${subjectStatsHtml || '<p>暂无数据</p>'}
        </div>
    `;
}

// 加载错题本
async function loadWrongQuestions() {
    try {
        const response = await fetch(`/api/wrong-questions/${userId}`);
        const questions = await response.json();
        
        displayWrongQuestions(questions);
    } catch (error) {
        console.error('加载错题失败:', error);
    }
}

// 显示错题
function displayWrongQuestions(questions) {
    const container = document.getElementById('wrong-questions-container');
    if (!container) return;
    
    if (questions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">暂无错题</p>';
        return;
    }
    
    let questionsHtml = '';
    questions.forEach((question, index) => {
        questionsHtml += `
            <div class="question-card">
                <div class="question-header">
                    <span class="question-type">${question.type}</span>
                    <span class="question-subject">${question.subject}</span>
                </div>
                <div class="question-text">${question.question}</div>
                <div class="explanation">
                    <h4>正确答案: ${question.correct_answer}</h4>
                    <p>${question.explanation}</p>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = questionsHtml;
}
