# 📝 现代化 Todo 应用

一个功能完整的全栈待办事项管理应用，支持任务、笔记、日记三种类型，提供类似飞书/ChatGPT的现代化用户体验。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.100.0+-green.svg)

## 🚀 快速开始 (3分钟上手)

### 一键启动
```bash
# 1. 启动后端 (新终端窗口)
cd backend
pip install -r requirements.txt
python run.py

# 2. 启动前端 (新终端窗口)  
cd frontend
npm install
npm run dev
```

### 访问应用
- **前端应用**: http://localhost:3001
- **后端API**: http://localhost:8001
- **API文档**: http://localhost:8001/docs

### 首次使用
1. 打开 http://localhost:3001
2. 点击"注册"创建账户
3. 登录后即可开始使用

## ✨ 核心功能

### 🎯 多类型内容管理
- **任务管理**: 待办事项、进度跟踪、优先级设置
- **笔记记录**: 知识整理、想法记录、文档管理  
- **日记写作**: 日常记录、心情日记、生活感悟

### ⌨️ 现代化交互体验
- **键盘快捷键**: ⌘K 命令面板、⌘N 快速新建、⌘S 保存
- **智能编辑**: 回车保存、Shift+回车换行、自动保存
- **命令面板**: 快速搜索、导航、创建内容
- **实时反馈**: 自动保存状态、操作提示、加载动画

### 🎨 优雅的界面设计
- **双栏布局**: 左侧列表 + 右侧详情，类似飞书/ChatGPT
- **信息层级**: 三行结构展示标题、时间、预览
- **视觉反馈**: 选中高亮、悬停效果、状态指示
- **响应式设计**: 适配桌面和移动设备

## 🛠️ 技术栈

### 后端技术
- **FastAPI**: 高性能 Python Web 框架
- **SQLAlchemy**: ORM 数据库操作
- **SQLite**: 轻量级关系型数据库
- **JWT**: 用户身份认证
- **Uvicorn**: ASGI 服务器

### 前端技术
- **React**: 用户界面框架
- **TypeScript**: 类型安全的 JavaScript
- **Vite**: 快速构建工具
- **Tailwind CSS**: 实用优先的 CSS 框架
- **Axios**: HTTP 客户端

## 📖 使用指南

### 🎯 基本操作

#### 1. 注册和登录
- 打开 http://localhost:3001
- 点击"注册"创建新账户
- 填写用户名、邮箱、密码
- 注册成功后自动登录

#### 2. 创建内容
- **快速创建**: 按 `⌘N` 或点击"新建"按钮
- **命令面板**: 按 `⌘K` 打开搜索和快速操作
- **选择类型**: 任务、笔记、日记三种类型

#### 3. 编辑和保存
- **智能保存**: 内容会自动保存，底部显示保存状态
- **快捷键保存**: 按 `⌘S` 或 `回车` 立即保存
- **换行**: 按 `Shift+回车` 在内容中换行

### ⌨️ 键盘快捷键

| 快捷键 | 功能 | 说明 |
|--------|------|------|
| `⌘K` / `Ctrl+K` | 命令面板 | 快速搜索和操作 |
| `⌘N` / `Ctrl+N` | 新建内容 | 快速创建新项目 |
| `⌘S` / `Ctrl+S` | 保存 | 立即保存当前编辑 |
| `回车` | 保存 | 在输入框中保存并创建 |
| `Shift+回车` | 换行 | 在内容区域换行 |
| `Esc` | 取消 | 取消当前操作 |

### 🎨 界面说明

#### 左侧列表
- **三行结构**: 标题(粗体) / 时间(灰色) / 预览(浅灰)
- **选中状态**: 蓝色高亮条 + 浅蓝背景
- **悬停效果**: 鼠标悬停时显示浅蓝背景

#### 右侧详情
- **粘性标题**: 滚动时标题栏保持可见
- **类型徽章**: 显示内容类型(任务/笔记/日记)
- **编辑区域**: 标题和内容编辑框
- **自动保存**: 底部显示保存状态

## 🛠️ 故障排除

### ❗ 常见问题及解决方案

#### 🚨 端口问题
**问题**: 前端端口自动递增 (3001 → 3002 → 3003...)
```bash
# 解决方案: 检查 vite.config.ts 是否包含 strictPort: true
# 如果端口被占用，应该报错而不是自动递增
```

**问题**: 后端端口 8001 被占用
```bash
# 检查端口占用
netstat -ano | findstr :8001  # Windows
lsof -i :8001                  # macOS/Linux

# 使用不同端口启动
python run.py --port 8002
```

#### 🐍 后端问题

**问题**: 后端启动失败
```bash
# 检查 Python 版本
python --version  # 需要 3.8+

# 重新安装依赖
pip install --upgrade pip
pip install -r requirements.txt

# 使用 run.py 启动 (推荐)
cd backend
python run.py
```

**问题**: 注册功能不工作
```bash
# 检查 CORS 配置
# 确保 backend/app/main.py 中包含前端端口 3001
# 检查浏览器控制台是否有 CORS 错误
```

#### ⚛️ 前端问题

**问题**: 前端启动失败
```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install

# 检查 Node.js 版本
node --version  # 需要 16+

# 使用正确的启动命令
cd frontend
npm run dev
```

**问题**: 页面空白或加载失败
```bash
# 检查后端是否正常运行
curl http://localhost:8001/health

# 检查浏览器控制台错误
# F12 → Console 查看错误信息
```

#### 🔧 PowerShell 问题 (Windows)

**问题**: `&&` 操作符错误
```powershell
# 错误: cd frontend && npm run dev
# 正确: 分别执行命令
cd frontend
npm run dev
```

**问题**: 路径包含中文字符
```powershell
# 确保路径中没有特殊字符
# 建议将项目放在英文路径下
```

### 🆘 获取帮助

如果遇到其他问题：
1. 查看浏览器控制台错误信息
2. 检查后端终端错误日志  
3. 确认端口没有被其他程序占用
4. 尝试重启服务

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

## 🤝 贡献指南

我们欢迎社区贡献！无论是 bug 修复、功能增强还是文档改进。

### 开发流程
1. Fork 项目到个人仓库
2. 创建功能分支进行开发
3. 提交代码并创建 Pull Request
4. 代码审查和合并

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 规则
- 编写清晰的注释和文档
- 提交信息使用 Conventional Commits 格式

---

⭐ 如果这个项目对你有帮助，请点击 Star 支持我们！

🐛 发现问题？[提交 Issue](https://github.com/your-username/todo-app/issues/new)

🚀 想要贡献代码？查看 [贡献指南](#-贡献指南)