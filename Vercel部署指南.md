# Vercel 部署指南

## 快速部署步骤

### 方法一：拖拽部署（最简单）
1. 访问 https://vercel.com/new
2. 将整个项目文件夹拖入页面
3. 等待部署完成

### 方法二：命令行部署

**1. 安装 Vercel CLI**
```bash
npm install -g vercel
```

**2. 登录 Vercel**
```bash
vercel login
```

**3. 部署**
```bash
# 进入项目目录
cd cpa-exam-system

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

## 部署后配置

部署完成后，Vercel 会提供类似以下格式的 URL：
```
https://your-project.vercel.app
```

## 注意事项

1. **路由配置**：已配置 vercel.json，所有 public 文件夹下的资源会被正确服务
2. **SPA 支持**：如需支持单页应用路由，需添加配置
3. **环境变量**：如需 Supabase 配置，请设置环境变量

## 自定义域名（可选）

1. 在 Vercel Dashboard 中选择项目
2. 进入 Settings → Domains
3. 添加您的自定义域名
