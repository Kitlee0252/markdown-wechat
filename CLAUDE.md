# CLAUDE.md

使用中文和用户交流。
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个Markdown转微信公众号富文本转换工具，将标准Markdown文件转换为微信公众号兼容的HTML格式。该项目处理微信特定的样式要求、图片处理和格式化约束。

## Architecture

### 当前实现的技术架构
- **纯前端单页应用（SPA）**：使用Vanilla JavaScript，无框架依赖
- **本地化处理**：所有转换在浏览器本地进行，无后端依赖
- **模块化设计**：按功能分离的JavaScript模块

### Core Components
- **app.js**: 主应用逻辑，处理UI交互和事件绑定
- **markdown-parser.js**: Markdown解析模块，基于marked.js
- **wechat-adapter.js**: 微信适配模块，处理样式内联化和HTML标签限制
- **template-manager.js**: 模板管理模块，处理多种样式模板切换
- **utils.js**: 工具函数，处理文件操作、剪贴板等通用功能

### Tech Stack
- **Vanilla JavaScript**: 无框架依赖，轻量高效
- **marked.js**: Markdown解析，支持GitHub Flavored Markdown (GFM)
- **DOMPurify**: HTML安全净化，防止XSS攻击
- **CSS Grid**: 现代化响应式布局
- **Clipboard API**: 剪贴板操作，带兼容性回退

## Development Commands

### 本地运行
```bash
# 使用Python启动本地服务器
python -m http.server 8080

# 或使用Node.js
npx http-server

# 或使用Live Server扩展直接打开index.html
```

### 文件结构
```
project/
├── index.html              # 主页面
├── css/
│   ├── app.css             # 应用基础样式
│   └── templates/          # 微信样式模板
│       ├── minimal.css     # 极简风格
│       ├── tech.css        # 技术风格（待实现）
│       └── academic.css    # 学术风格（待实现）
├── js/
│   ├── app.js              # 主应用逻辑
│   ├── markdown-parser.js  # Markdown解析模块
│   ├── wechat-adapter.js   # 微信适配模块
│   ├── template-manager.js # 模板管理模块
│   └── utils.js            # 工具函数
└── libs/                   # 第三方库
    ├── marked.min.js       # Markdown解析
    └── dompurify.min.js    # HTML净化
```

## WeChat-Specific Considerations

### 微信适配策略
- **样式内联化**: 所有CSS样式转为内联style属性，避免微信编辑器样式清洗
- **HTML标签限制**: 只使用微信编辑器支持的安全标签，过滤不支持的属性
- **图片处理**: 小图片(<500KB)转base64内嵌，大图片提供下载选项
- **重要样式标记**: 关键样式添加!important声明

### 实现细节
- 所有转换在浏览器本地进行，保护用户隐私
- 实时预览功能带防抖处理（300ms延迟）
- 支持拖拽上传.md文件和图片
- 一键复制富文本到微信公众号编辑器

## Development Tasks Priority

### 第一阶段：核心MVP（已完成基础框架）
- [x] 基础界面和布局
- [x] Markdown解析集成
- [x] 一种基础样式模板
- [x] 实时预览功能
- [x] 复制到剪贴板功能

### 第二阶段：增强功能（当前开发重点）
- [ ] 多样式模板系统（tech.css, academic.css）
- [ ] 数学公式支持（KaTeX集成）
- [ ] 流程图支持（Mermaid.js集成）
- [ ] 代码高亮功能（Prism.js集成）
- [ ] 图片处理模块
- [ ] 导出功能模块（HTML/ZIP）

### 第三阶段：优化和完善
- [ ] 微信适配优化
- [ ] 性能优化
- [ ] 用户体验优化
- [ ] 浏览器兼容性测试

## Current Implementation Status

该项目已实现基础MVP功能，包括Markdown编辑、实时预览、基础样式模板和复制功能。当前正在第二阶段开发中，重点添加增强功能如数学公式、流程图、代码高亮等。