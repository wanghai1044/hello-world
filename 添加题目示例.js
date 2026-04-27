/**
 * 批量添加题目示例
 * 运行方法：node 添加题目示例.js
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = './data.json';

// 读取现有数据
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('读取数据失败:', e);
    }
    return { questions: [], users: [], answer_records: [], exam_records: [] };
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

// 生成新ID
function generateId(array) {
    if (array.length === 0) return 1;
    return Math.max(...array.map(item => item.id)) + 1;
}

// 更多示例题目
const newQuestions = [
    {
        subject: '经济法',
        chapter: '第一章 法律基本原理',
        type: '单选题',
        difficulty: 1,
        question: '下列关于法律关系的表述中，正确的是？',
        option_a: '法律关系是一种思想社会关系',
        option_b: '法律关系的主体只能是自然人',
        option_c: '法律关系的客体不包括行为',
        option_d: '法律关系的内容是指主体所享有的权利和承担的义务',
        correct_answer: 'D',
        explanation: '法律关系的主体包括自然人、法人和其他组织；客体包括物、行为、智力成果等；内容是指主体享有的权利和承担的义务。'
    },
    {
        subject: '经济法',
        chapter: '第二章 基本民事法律制度',
        type: '多选题',
        difficulty: 2,
        question: '下列关于民事法律行为效力的表述中，正确的有？',
        option_a: '民事法律行为可以附条件',
        option_b: '民事法律行为可以附期限',
        option_c: '附生效条件的民事法律行为，自条件成就时生效',
        option_d: '附解除条件的民事法律行为，自条件成就时失效',
        option_e: '民事法律行为一律不得撤销',
        correct_answer: 'ABCD',
        explanation: '民事法律行为可以附条件和附期限；附生效条件的民事法律行为自条件成就时生效；附解除条件的民事法律行为自条件成就时失效；部分民事法律行为可以撤销。'
    },
    {
        subject: '公司战略与风险管理',
        chapter: '第一章 战略与战略管理',
        type: '单选题',
        difficulty: 1,
        question: '下列关于战略管理的表述中，错误的是？',
        option_a: '战略管理是一个循环往复的过程',
        option_b: '战略管理是企业的高层次管理',
        option_c: '战略管理的核心是使企业适应不断变化的外部环境',
        option_d: '战略管理只关注长期问题，不关注短期问题',
        correct_answer: 'D',
        explanation: '战略管理不仅关注长期问题，也关注短期问题，需要将长短期目标相结合。'
    },
    {
        subject: '会计',
        chapter: '第二章 会计政策和会计估计及其变更',
        type: '计算题',
        difficulty: 3,
        question: '某企业2019年1月1日购入一台设备，原价100万元，预计使用5年，预计净残值5万元。采用年限平均法计提折旧。2021年1月1日，该企业将该设备的折旧方法改为双倍余额递减法，预计使用年限和预计净残值不变。要求：计算2021年该设备应计提的折旧额。',
        option_a: '20万元',
        option_b: '25万元',
        option_c: '24万元',
        option_d: '30万元',
        correct_answer: 'C',
        explanation: '2019年和2020年按年限平均法每年折旧额=(100-5)/5=19万元，2021年初账面价值=100-19×2=62万元。改为双倍余额递减法后，折旧率=2/5=40%，2021年折旧额=62×40%=24.8万元，应选最接近的24万元。'
    },
    {
        subject: '审计',
        chapter: '第二章 审计计划',
        type: '单选题',
        difficulty: 2,
        question: '下列关于重要性水平的表述中，正确的是？',
        option_a: '重要性水平越高，审计风险越低',
        option_b: '重要性水平越低，审计风险越高',
        option_c: '重要性水平与审计风险呈同向变动关系',
        option_d: '重要性水平与审计证据数量呈同向变动关系',
        correct_answer: 'B',
        explanation: '重要性水平越低，审计风险越高；重要性水平与审计风险呈反向变动关系；重要性水平与审计证据数量呈反向变动关系。'
    }
];

// 主函数
function main() {
    console.log('开始添加题目...');
    
    const data = loadData();
    
    newQuestions.forEach(q => {
        const newQuestion = {
            id: generateId(data.questions),
            ...q
        };
        data.questions.push(newQuestion);
        console.log(`已添加题目 ID:${newQuestion.id} - ${q.subject} - ${q.question.substring(0, 20)}...`);
    });
    
    if (saveData(data)) {
        console.log(`\n成功添加 ${newQuestions.length} 道题目！`);
        console.log(`当前题目总数: ${data.questions.length}`);
    } else {
        console.log('保存失败！');
    }
}

main();
