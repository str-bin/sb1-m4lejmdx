# Smart NewTab - 智能新标签页

一个美观且功能强大的书签管理应用，支持**双数据源架构**：

- **网页版**：使用 IndexedDB 本地存储，可部署到任何静态托管服务
- **插件版**：直接读取浏览器书签数据，作为Chrome扩展运行

两种模式共享相同的UI组件，提供拖拽式书签管理和智能分类功能。

## ✨ 主要功能

### 🎯 智能书签管理
- **拖拽排序**：支持拖拽重新排列书签位置
- **分类管理**：预设常用、工作、学习、娱乐、工具等分类
- **标签系统**：为书签添加自定义标签，便于搜索和分类
- **搜索功能**：支持按标题、URL、标签进行模糊搜索

### 🎨 美观界面
- **现代化设计**：采用毛玻璃效果和渐变背景
- **响应式布局**：适配不同屏幕尺寸
- **深色/浅色主题**：自动跟随系统主题切换
- **动画效果**：流畅的悬停和交互动画

### 🔧 便捷操作
- **一键添加**：快速添加新书签
- **编辑功能**：随时修改书签信息
- **删除确认**：安全删除书签
- **链接复制**：快速复制书签链接
- **外部打开**：在新标签页中打开书签

## 🚀 技术栈

- **框架**：React 18 + TypeScript
- **构建工具**：
  - 网页版：Vite
  - 插件版：Plasmo (浏览器扩展框架)
- **状态管理**：Zustand
- **UI组件**：Radix UI + Tailwind CSS
- **拖拽功能**：React Beautiful DnD
- **表单处理**：React Hook Form + Zod
- **数据存储**：
  - 网页版：IndexedDB
  - 插件版：Chrome Bookmarks API

## 📦 安装和运行

### 开发环境

```bash
# 安装依赖
pnpm install

# 网页版开发
pnpm dev:web

# 插件版开发
pnpm dev

# 网页版构建
pnpm build:web

# 插件版构建
pnpm build

# 打包扩展
pnpm package
```

### 网页版部署

1. 运行 `pnpm build:web` 构建网页版
2. 将 `dist/` 目录部署到静态托管服务（如 GitHub Pages、Vercel、Netlify）
3. 或运行 `pnpm preview` 本地预览

### 插件版安装

1. 运行 `pnpm build` 构建扩展
2. 打开浏览器扩展管理页面
3. 启用开发者模式
4. 点击"加载已解压的扩展程序"
5. 选择 `build/chrome-mv3-dev` 目录

## 🎯 使用说明

### 添加书签
1. 点击右上角的 "+" 按钮
2. 填写书签标题、URL、分类和标签
3. 点击保存即可

### 管理书签
- **拖拽排序**：直接拖拽书签卡片重新排列
- **编辑书签**：点击书签卡片右上角的菜单按钮
- **删除书签**：在菜单中选择删除选项
- **复制链接**：在菜单中选择复制链接

### 搜索和筛选
- **搜索框**：输入关键词搜索书签
- **分类筛选**：点击分类标签筛选特定分类的书签

## 🔧 配置说明

### 默认分类
- 常用 (蓝色) - 日常使用的网站
- 工作 (红色) - 工作相关网站
- 学习 (绿色) - 学习资源网站
- 娱乐 (橙色) - 娱乐休闲网站
- 工具 (紫色) - 实用工具网站

### 数据存储
- **网页版**：使用 IndexedDB 本地存储，数据持久化在浏览器中
- **插件版**：直接读取和操作浏览器书签，与浏览器书签同步
- 支持数据源切换和导入/导出功能

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)

## 📄 许可证

MIT License

## 🔗 相关链接

- [Plasmo 文档](https://docs.plasmo.com/)
- [Vite 文档](https://vitejs.dev/)
- [Radix UI 组件库](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

## 📋 架构文档

详细的架构设计请参考 [ARCHITECTURE.md](./ARCHITECTURE.md)

---

**享受更智能的书签管理体验！** 🎉