# GitHub推送脚本
Write-Host "🚀 开始准备GitHub推送..." -ForegroundColor Green

# 1. 清理不必要的文件
Write-Host "🧹 清理项目文件..." -ForegroundColor Yellow
if (Test-Path "GitHub上传说明.md") {
    Remove-Item "GitHub上传说明.md" -Force
    Write-Host "已删除: GitHub上传说明.md" -ForegroundColor Red
}
if (Test-Path "todo-app-for-github.zip") {
    Remove-Item "todo-app-for-github.zip" -Force
    Write-Host "已删除: todo-app-for-github.zip" -ForegroundColor Red
}
if (Test-Path "todo.db.backup") {
    Remove-Item "todo.db.backup" -Force
    Write-Host "已删除: todo.db.backup" -ForegroundColor Red
}

# 2. 检查.gitignore
Write-Host "📝 检查.gitignore文件..." -ForegroundColor Yellow
$gitignoreContent = @"
# 依赖目录
node_modules/
venv/
__pycache__/

# 数据库文件
*.db
*.sqlite

# 日志文件
*.log

# 环境变量
.env
.env.local

# 构建输出
dist/
build/

# IDE文件
.vscode/
.idea/

# 操作系统文件
.DS_Store
Thumbs.db

# 临时文件
*.tmp
*.temp
"@

Set-Content -Path ".gitignore" -Value $gitignoreContent -Encoding UTF8
Write-Host "已更新: .gitignore" -ForegroundColor Cyan

# 3. 添加所有文件
Write-Host "📦 添加文件到Git..." -ForegroundColor Yellow
git add .

# 4. 检查状态
Write-Host "📊 Git状态:" -ForegroundColor Cyan
git status --short

# 5. 提交更改
Write-Host "💾 提交更改..." -ForegroundColor Yellow
git commit -m "feat: 现代化Todo应用 - 完整功能实现

✨ 核心功能:
- 支持任务、笔记、日记三种类型
- 现代化双栏布局UI设计
- 键盘快捷键和命令面板
- JWT用户认证系统
- 响应式设计

🛠️ 技术栈:
- 前端: React 18 + TypeScript + Vite + Tailwind CSS
- 后端: FastAPI + SQLAlchemy + SQLite + JWT
- 工具: Axios, Lucide React, date-fns

🚀 生产就绪的完整全栈应用"

Write-Host "✅ 提交完成！" -ForegroundColor Green

# 6. 显示下一步操作
Write-Host "`n🎯 下一步操作:" -ForegroundColor Cyan
Write-Host "1. 在GitHub创建新仓库" -ForegroundColor White
Write-Host "2. 运行以下命令连接远程仓库:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/您的用户名/仓库名.git" -ForegroundColor Gray
Write-Host "3. 推送到GitHub:" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host "`n📖 详细步骤请查看: GitHub推送指南.md" -ForegroundColor Yellow
