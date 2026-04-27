# 注册会计师题库系统

一个功能完整的注册会计师（CPA）考试题库系统，支持顺序练习、随机练习、模拟考试、错题本和统计分析等功能。

## 功能特性

- ✅ **顺序练习**：按科目、章节顺序练习题目
- ✅ **随机练习**：随机抽取题目进行练习
- ✅ **模拟考试**：全真模拟考试环境，支持计时
- ✅ **错题本**：自动记录错题，方便复习
- ✅ **统计分析**：查看答题正确率和各科统计
- ✅ **题目管理**：支持添加、查看题目（可扩展编辑、删除功能）

## 技术栈

- **后端**：Node.js + Express
- **前端**：原生HTML + CSS + JavaScript
- **数据存储**：JSON文件（简化版）/ SQLite（完整版）

## 安装步骤

### 1. 安装依赖

```bash
npm install
```

或使用简化版（不需要SQLite）：

```bash
npm install express body-parser cors
```

### 2. 启动服务器

**简化版（推荐，使用JSON文件存储）：**

```bash
npm start
```

**完整版（使用SQLite数据库）：**

```bash
npm run server
```

### 3. 访问系统

打开浏览器访问：`http://localhost:3000`

## 项目结构

```
cpa-exam-system/
├── server.js           # 完整版服务器（SQLite）
├── server-simple.js    # 简化版服务器（JSON文件）
├── package.json        # 项目配置
├── data.json          # 数据存储文件（简化版自动生成）
├── database.db        # SQLite数据库（完整版自动生成）
└── public/           # 前端文件
    ├── index.html     # 首页
    ├── practice.html  # 顺序练习
    ├── random.html    # 随机练习
    ├── exam.html      # 模拟考试
    ├── wrong.html     # 错题本
    ├── statistics.html # 统计
    ├── style.css      # 样式文件
    └── app.js         # 前端逻辑
```

## 使用说明

### 1. 首页

- 查看六个考试科目卡片
- 快速选择练习模式
- 点击科目卡片直接进入练习

### 2. 顺序练习

- 选择科目
- 按顺序逐一作答
- 即时查看答案解析

### 3. 随机练习

- 选择科目和题目数量
- 系统随机抽取题目
- 适合快速刷题

### 4. 模拟考试

- 选择科目和考试时间
- 全真模拟考试环境
- 倒计时提醒
- 自动评分

### 5. 错题本

- 自动记录答错的题目
- 查看正确答案和解析
- 针对性复习

### 6. 统计分析

- 查看总体答题统计
- 各科目正确率分析
- 进度追踪

## 添加题目

### 通过API添加

```bash
curl -X POST http://localhost:3000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### 直接编辑数据文件

简化版：编辑 `data.json` 文件
完整版：使用SQLite工具编辑 `database.db`

## 默认题目

系统自带5道示例题目：

1. 会计 - 单选题：会计基本假设
2. 会计 - 多选题：会计信息质量要求
3. 审计 - 单选题：审计证据
4. 财务成本管理 - 计算题：净现值计算
5. 税法 - 单选题：中央与地方共享税

## 开发计划

- [ ] 用户注册/登录系统
- [ ] 题目批量导入（Excel/CSV）
- [ ] 更丰富的统计图表
- [ ] 移动端适配
- [ ] 题目收藏功能
- [ ] 学习笔记功能
- [ ] 社交分享功能

## 常见问题

**Q: 如何添加更多题目？**
A: 可以通过API接口添加，或直接编辑数据文件。

**Q: 数据会丢失吗？**
A: 简化版使用JSON文件存储，数据持久保存。完整版使用SQLite数据库。

**Q: 如何修改端口？**
A: 修改 `server-simple.js` 或 `server.js` 中的 `PORT` 变量。

## 许可证

MIT License

## 作者

注册会计师题库系统开发团队

---

**祝考试顺利！**
