# Railway 部署指南

## 部署步骤

### 1. 准备工作
将以下文件准备好（或直接使用当前项目）：

```
├── server-simple.js     # 主服务器
├── package.json         # 依赖配置
├── public/              # 前端文件
│   ├── index.html
│   ├── practice.html
│   ├── random.html
│   ├── exam.html
│   ├── wrong.html
│   ├── statistics.html
│   ├── style.css
│   └── app.js
└── data.json            # 数据文件
```

### 2. 创建 Railway 账户
1. 访问 https://railway.app
2. 使用 GitHub 账户登录
3. 点击 "New Project" → "Deploy from GitHub repo"

### 3. 部署配置
Railway 会自动检测 Node.js 项目，无需额外配置。

如果需要手动配置：
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Port:** `3000`

### 4. 环境变量（如需要）
在 Railway 控制台添加：
- `PORT` = `3000`

---

## Railway 优势
- ✅ 免费额度充足（500小时/月）
- ✅ 自动保持活跃
- ✅ 免费SSL证书
- ✅ 自动部署
- ✅ 支持自定义域名

---

## 备选：Render 平台
如果 Railway 不可用，也可使用 Render：
1. 访问 https://render.com
2. 创建 Web Service
3. 连接 GitHub 仓库
4. 设置：
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free
