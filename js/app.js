// 主应用逻辑

class MarkdownWeChatApp {
    constructor() {
        // 初始化模块
        this.markdownParser = new MarkdownParser();
        this.wechatAdapter = new WeChatAdapter();
        this.templateManager = new TemplateManager();

        // DOM 元素引用
        this.elements = {};

        // 应用状态
        this.currentMarkdown = '';
        this.currentHtml = '';
        this.currentFileName = '';
        this.isProcessing = false;

        // 初始化应用
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        this.initElements();
        this.bindEvents();
        this.loadInitialContent();
        this.templateManager.loadFromLocalStorage();
        this.updateTemplateSelector();
        this.updatePreview();

        // 显示欢迎消息
        setTimeout(() => {
            showNotification('欢迎使用Markdown转微信公众号工具！', 'success', 2000);
        }, 500);
    }

    /**
     * 初始化DOM元素引用
     */
    initElements() {
        this.elements = {
            // 编辑器
            markdownEditor: document.getElementById('markdownEditor'),

            // 预览区域
            previewContent: document.getElementById('previewContent'),

            // 文件操作按钮
            fileInput: document.getElementById('fileInput'),
            importBtn: document.getElementById('importBtn'),
            newBtn: document.getElementById('newBtn'),
            clearBtn: document.getElementById('clearBtn'),

            // 导出按钮
            copyBtn: document.getElementById('copyBtn'),
            exportHtmlBtn: document.getElementById('exportHtmlBtn'),
            exportZipBtn: document.getElementById('exportZipBtn'),

            // 模板选择器
            templateSelect: document.getElementById('templateSelect'),

            // 状态栏
            fileStatus: document.getElementById('fileStatus'),
            wordCount: document.getElementById('wordCount')
        };
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 编辑器输入事件（带防抖）
        this.elements.markdownEditor.addEventListener('input',
            debounce(() => this.onEditorChange(), 300)
        );

        // 文件操作事件
        this.elements.importBtn.addEventListener('click', () => this.onImportClick());
        this.elements.fileInput.addEventListener('change', (e) => this.onFileSelect(e));
        this.elements.newBtn.addEventListener('click', () => this.onNewDocument());
        this.elements.clearBtn.addEventListener('click', () => this.onClearContent());

        // 导出功能事件
        this.elements.copyBtn.addEventListener('click', () => this.onCopyRichText());
        this.elements.exportHtmlBtn.addEventListener('click', () => this.onExportHtml());
        this.elements.exportZipBtn.addEventListener('click', () => this.onExportZip());

        // 模板选择事件
        this.elements.templateSelect.addEventListener('change', (e) => this.onTemplateChange(e));

        // 拖拽事件
        this.bindDragDropEvents();

        // 快捷键事件
        this.bindKeyboardEvents();

        // 窗口事件
        window.addEventListener('beforeunload', (e) => this.onBeforeUnload(e));
        window.addEventListener('resize', debounce(() => this.onWindowResize(), 100));
    }

    /**
     * 绑定拖拽事件
     */
    bindDragDropEvents() {
        const editor = this.elements.markdownEditor;

        editor.addEventListener('dragover', (e) => {
            e.preventDefault();
            editor.classList.add('drag-over');
        });

        editor.addEventListener('dragleave', (e) => {
            e.preventDefault();
            if (!editor.contains(e.relatedTarget)) {
                editor.classList.remove('drag-over');
            }
        });

        editor.addEventListener('drop', (e) => {
            e.preventDefault();
            editor.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });
    }

    /**
     * 绑定键盘事件
     */
    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+O: 打开文件
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                this.onImportClick();
            }

            // Ctrl+N: 新建文件
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.onNewDocument();
            }

            // Ctrl+S: 导出HTML
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.onExportHtml();
            }

            // Ctrl+Shift+C: 复制富文本
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.onCopyRichText();
            }
        });
    }

    /**
     * 加载初始内容
     */
    loadInitialContent() {
        this.currentMarkdown = this.elements.markdownEditor.value;
        this.updateStatus('状态: 就绪', this.currentMarkdown);
    }

    /**
     * 编辑器内容变化处理
     */
    onEditorChange() {
        const newContent = this.elements.markdownEditor.value;

        if (newContent !== this.currentMarkdown) {
            this.currentMarkdown = newContent;
            this.updatePreview();
            this.updateStatus('状态: 已修改', newContent);
        }
    }

    /**
     * 更新预览内容
     */
    updatePreview() {
        if (this.isProcessing) return;

        try {
            this.isProcessing = true;

            // 解析Markdown
            const preprocessed = this.markdownParser.preprocess(this.currentMarkdown);
            const html = this.markdownParser.parse(preprocessed);

            // 适配微信格式
            const currentTemplate = this.templateManager.getCurrentTemplate();
            this.currentHtml = this.wechatAdapter.adapt(html, currentTemplate);

            // 更新预览区域
            this.elements.previewContent.innerHTML = this.currentHtml;

            // 验证微信兼容性
            const validation = this.wechatAdapter.validateForWeChat(this.currentHtml);
            if (!validation.isValid && validation.issues.length > 0) {
                console.warn('微信兼容性问题:', validation.issues);
            }

        } catch (error) {
            console.error('预览更新失败:', error);
            this.elements.previewContent.innerHTML = `
                <div style="color: red; padding: 20px;">
                    <h3>预览错误</h3>
                    <p>${error.message}</p>
                </div>
            `;
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * 更新状态信息
     */
    updateStatus(status, content) {
        this.elements.fileStatus.textContent = status;

        const stats = this.markdownParser.getStats(content);
        this.elements.wordCount.textContent = `字数: ${stats.words}`;
    }

    /**
     * 更新模板选择器
     */
    updateTemplateSelector() {
        const select = this.elements.templateSelect;
        const templates = this.templateManager.getTemplateList();

        select.innerHTML = '';
        templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.key;
            option.textContent = template.name;
            select.appendChild(option);
        });

        select.value = this.templateManager.getCurrentTemplate();
    }

    /**
     * 导入文件点击处理
     */
    onImportClick() {
        this.elements.fileInput.click();
    }

    /**
     * 文件选择处理
     */
    onFileSelect(event) {
        const files = event.target.files;
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
        // 清空input以便重复选择相同文件
        event.target.value = '';
    }

    /**
     * 处理文件
     */
    async handleFile(file) {
        try {
            // 验证文件类型
            if (!isValidFileType(file, ['md', 'txt', 'markdown'])) {
                showNotification('请选择Markdown文件（.md, .txt, .markdown）', 'error');
                return;
            }

            // 检查文件大小
            if (file.size > 5 * 1024 * 1024) { // 5MB
                const confirm = window.confirm('文件较大（>5MB），可能影响性能。是否继续？');
                if (!confirm) return;
            }

            this.updateStatus('状态: 正在加载文件...', '');

            // 读取文件内容
            const content = await readFileContent(file);

            // 更新编辑器
            this.elements.markdownEditor.value = content;
            this.currentMarkdown = content;
            this.currentFileName = file.name;

            // 更新预览和状态
            this.updatePreview();
            this.updateStatus(`状态: 已加载 ${file.name}`, content);

            showNotification(`成功加载文件: ${file.name}`, 'success');

        } catch (error) {
            console.error('文件处理失败:', error);
            showNotification('文件加载失败: ' + error.message, 'error');
            this.updateStatus('状态: 文件加载失败', '');
        }
    }

    /**
     * 新建文档
     */
    onNewDocument() {
        if (this.currentMarkdown && this.currentMarkdown.trim()) {
            const confirm = window.confirm('当前有未保存的内容，确定新建文档吗？');
            if (!confirm) return;
        }

        this.elements.markdownEditor.value = '';
        this.currentMarkdown = '';
        this.currentFileName = '';
        this.updatePreview();
        this.updateStatus('状态: 新建文档', '');

        // 聚焦到编辑器
        this.elements.markdownEditor.focus();
    }

    /**
     * 清空内容
     */
    onClearContent() {
        if (this.currentMarkdown && this.currentMarkdown.trim()) {
            const confirm = window.confirm('确定要清空所有内容吗？');
            if (!confirm) return;
        }

        this.elements.markdownEditor.value = '';
        this.currentMarkdown = '';
        this.updatePreview();
        this.updateStatus('状态: 已清空', '');

        showNotification('内容已清空', 'success');
    }

    /**
     * 复制富文本
     */
    async onCopyRichText() {
        if (!this.currentHtml) {
            showNotification('没有内容可复制', 'warning');
            return;
        }

        try {
            // 创建临时元素用于复制
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.currentHtml;
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);

            // 选择内容
            const range = document.createRange();
            range.selectNodeContents(tempDiv);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            // 复制到剪贴板
            const success = document.execCommand('copy');

            // 清理
            selection.removeAllRanges();
            document.body.removeChild(tempDiv);

            if (success) {
                showNotification('富文本已复制到剪贴板', 'success');
            } else {
                throw new Error('复制命令执行失败');
            }

        } catch (error) {
            console.error('复制失败:', error);

            // 回退到纯文本复制
            try {
                const success = await copyToClipboard(this.currentHtml);
                if (success) {
                    showNotification('HTML代码已复制到剪贴板', 'success');
                } else {
                    showNotification('复制失败，请手动复制', 'error');
                }
            } catch (fallbackError) {
                showNotification('复制失败，请手动复制', 'error');
            }
        }
    }

    /**
     * 导出HTML文件
     */
    onExportHtml() {
        if (!this.currentHtml) {
            showNotification('没有内容可导出', 'warning');
            return;
        }

        try {
            const fileName = this.currentFileName ?
                this.currentFileName.replace(/\.(md|txt|markdown)$/i, '.html') :
                `markdown_wechat_${getTimestamp()}.html`;

            const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>微信公众号文章</title>
    <style>
        body {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
    </style>
</head>
<body>
${this.currentHtml}
</body>
</html>`;

            downloadFile(fullHtml, fileName, 'text/html');
            showNotification(`HTML文件已导出: ${fileName}`, 'success');

        } catch (error) {
            console.error('导出失败:', error);
            showNotification('导出失败: ' + error.message, 'error');
        }
    }

    /**
     * 导出ZIP文件（暂未实现）
     */
    onExportZip() {
        showNotification('ZIP导出功能开发中...', 'warning');
        // TODO: 实现ZIP打包功能，包含HTML文件和图片资源
    }

    /**
     * 模板变更处理
     */
    onTemplateChange(event) {
        const newTemplate = event.target.value;

        if (this.templateManager.setCurrentTemplate(newTemplate)) {
            this.updatePreview();
            this.templateManager.saveToLocalStorage();
            showNotification(`已切换到${this.templateManager.getTemplate(newTemplate).name}`, 'success');
        }
    }

    /**
     * 窗口关闭前处理
     */
    onBeforeUnload(event) {
        if (this.currentMarkdown && this.currentMarkdown.trim()) {
            const message = '你有未保存的更改，确定要离开吗？';
            event.returnValue = message;
            return message;
        }
    }

    /**
     * 窗口大小变更处理
     */
    onWindowResize() {
        // 这里可以添加响应式处理逻辑
    }
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MarkdownWeChatApp();
});