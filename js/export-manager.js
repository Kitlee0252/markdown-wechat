// 导出管理器

class ExportManager {
    constructor(app) {
        this.app = app;
        this.exportHistory = [];
        this.maxHistory = 10;
    }

    /**
     * 检查JSZip是否可用
     * @returns {boolean} JSZip是否可用
     */
    isJSZipAvailable() {
        return typeof JSZip !== 'undefined';
    }

    /**
     * 导出HTML文件
     * @param {string} content - HTML内容
     * @param {string} fileName - 文件名
     * @param {Object} options - 导出选项
     * @returns {Promise<boolean>} 导出是否成功
     */
    async exportHTML(content, fileName, options = {}) {
        try {
            const opts = {
                includeStyles: true,
                includeMetadata: true,
                template: 'full', // 'full' | 'content-only'
                ...options
            };

            let htmlContent;

            if (opts.template === 'content-only') {
                htmlContent = content;
            } else {
                htmlContent = this.generateFullHTMLDocument(content, opts);
            }

            // 下载文件
            this.downloadTextFile(htmlContent, fileName, 'text/html');

            // 记录导出历史
            this.recordExport({
                type: 'html',
                fileName: fileName,
                timestamp: Date.now(),
                size: new Blob([htmlContent]).size
            });

            return true;

        } catch (error) {
            console.error('HTML导出失败:', error);
            throw error;
        }
    }

    /**
     * 生成完整的HTML文档
     * @param {string} content - 内容
     * @param {Object} options - 选项
     * @returns {string} 完整HTML
     */
    generateFullHTMLDocument(content, options = {}) {
        const currentTemplate = this.app.templateManager.getCurrentTemplate();
        const templateName = this.app.templateManager.getTemplate(currentTemplate)?.name || '默认样式';

        const metadata = options.includeMetadata ? this.generateMetadata() : '';
        const styles = options.includeStyles ? this.generateStyles(currentTemplate) : '';

        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>微信公众号文章 - ${this.getDocumentTitle()}</title>
    <meta name="generator" content="Markdown转微信公众号工具">
    <meta name="template" content="${templateName}">
    ${metadata}
    ${styles}
</head>
<body>
    <div class="wechat-content">
        ${content}
    </div>

    <footer style="margin-top: 3em; padding-top: 1em; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 0.875em; text-align: center;">
        <p>本文档由 <a href="#" style="color: #3b82f6; text-decoration: none;">Markdown转微信公众号工具</a> 生成</p>
        <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
    </footer>

    <script>
        // 添加一些基本的交互功能
        document.addEventListener('DOMContentLoaded', function() {
            // 代码块复制功能
            const codeBlocks = document.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                block.style.cursor = 'pointer';
                block.title = '点击复制代码';
                block.addEventListener('click', function() {
                    navigator.clipboard.writeText(this.textContent).then(() => {
                        const originalTitle = this.title;
                        this.title = '已复制!';
                        setTimeout(() => {
                            this.title = originalTitle;
                        }, 2000);
                    });
                });
            });

            // 图片点击放大
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                img.style.cursor = 'zoom-in';
                img.addEventListener('click', function() {
                    const overlay = document.createElement('div');
                    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:zoom-out;';

                    const enlargedImg = this.cloneNode();
                    enlargedImg.style.cssText = 'max-width:90%;max-height:90%;border-radius:8px;box-shadow:0 4px 24px rgba(0,0,0,0.3);';

                    overlay.appendChild(enlargedImg);
                    document.body.appendChild(overlay);

                    overlay.addEventListener('click', () => {
                        document.body.removeChild(overlay);
                    });
                });
            });
        });
    </script>
</body>
</html>`;
    }

    /**
     * 生成文档元数据
     * @returns {string} 元数据HTML
     */
    generateMetadata() {
        const stats = {
            words: this.app.markdownParser.getStats(this.app.currentMarkdown).words,
            characters: this.app.currentMarkdown.length,
            images: this.app.imageProcessor.getAllImages().length,
            codeBlocks: this.app.codeHighlighter.getCodeStats(this.app.currentMarkdown).fencedBlocks,
            mathFormulas: this.app.mathRenderer.getMathStats(this.app.currentMarkdown).total,
            diagrams: this.app.diagramRenderer.getDiagramStats(this.app.currentMarkdown).total
        };

        return `
    <meta name="description" content="包含 ${stats.words} 个单词，${stats.images} 张图片，${stats.codeBlocks} 个代码块的微信公众号文章">
    <meta name="keywords" content="微信公众号,Markdown,HTML,文章导出">
    <meta name="author" content="Markdown转微信公众号工具用户">
    <meta name="robots" content="noindex,nofollow">

    <!-- 统计信息 -->
    <meta name="doc-stats-words" content="${stats.words}">
    <meta name="doc-stats-characters" content="${stats.characters}">
    <meta name="doc-stats-images" content="${stats.images}">
    <meta name="doc-stats-code-blocks" content="${stats.codeBlocks}">
    <meta name="doc-stats-math-formulas" content="${stats.mathFormulas}">
    <meta name="doc-stats-diagrams" content="${stats.diagrams}">`;
    }

    /**
     * 生成样式
     * @param {string} template - 模板名称
     * @returns {string} 样式HTML
     */
    generateStyles(template) {
        // 基础样式
        let styles = `
    <style>
        body {
            max-width: 800px;
            margin: 2em auto;
            padding: 2em;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            background-color: #f9f9f9;
        }

        .wechat-content {
            background-color: white;
            padding: 2em;
            border-radius: 8px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
            body {
                padding: 1em;
                margin: 0;
            }
            .wechat-content {
                padding: 1.5em;
            }
        }

        /* 打印样式 */
        @media print {
            body {
                background: white;
                box-shadow: none;
                max-width: none;
                margin: 0;
                padding: 0;
            }
            .wechat-content {
                box-shadow: none;
                border-radius: 0;
            }
            footer {
                display: none;
            }
        }
    </style>`;

        // 尝试获取模板特定样式
        try {
            const templatePath = this.app.templateManager.getTemplateCSSPath(template);
            styles += `
    <link rel="stylesheet" href="${templatePath}">`;
        } catch (error) {
            console.warn('模板样式获取失败:', error);
        }

        return styles;
    }

    /**
     * 获取文档标题
     * @returns {string} 文档标题
     */
    getDocumentTitle() {
        const markdown = this.app.currentMarkdown;
        const fileName = this.app.currentFileName;

        // 尝试从Markdown中提取第一个标题
        const titleMatch = markdown.match(/^#\s+(.+)$/m);
        if (titleMatch) {
            return titleMatch[1].trim();
        }

        // 使用文件名
        if (fileName) {
            return fileName.replace(/\.(md|txt|markdown)$/i, '');
        }

        // 默认标题
        return `文档-${new Date().toLocaleDateString('zh-CN')}`;
    }

    /**
     * 导出ZIP文件
     * @param {string} content - HTML内容
     * @param {string} fileName - 文件名（不含扩展名）
     * @param {Object} options - 导出选项
     * @returns {Promise<boolean>} 导出是否成功
     */
    async exportZIP(content, fileName, options = {}) {
        if (!this.isJSZipAvailable()) {
            throw new Error('JSZip库未加载，无法导出ZIP文件');
        }

        try {
            const opts = {
                includeImages: true,
                includeResources: true,
                compressionLevel: 6,
                ...options
            };

            const zip = new JSZip();
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
            const zipFileName = `${fileName}-${timestamp}.zip`;

            // 生成HTML文件
            const htmlContent = this.generateFullHTMLDocument(content, opts);
            zip.file(`${fileName}.html`, htmlContent);

            // 添加资源文件
            if (opts.includeResources) {
                await this.addResourcesToZip(zip);
            }

            // 添加图片文件
            if (opts.includeImages) {
                await this.addImagesToZip(zip);
            }

            // 添加说明文件
            zip.file('README.txt', this.generateReadmeContent());

            // 添加元数据
            zip.file('metadata.json', JSON.stringify(this.generateMetadataJSON(), null, 2));

            // 生成ZIP文件
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: opts.compressionLevel
                }
            });

            // 下载文件
            this.downloadBlob(zipBlob, zipFileName);

            // 记录导出历史
            this.recordExport({
                type: 'zip',
                fileName: zipFileName,
                timestamp: Date.now(),
                size: zipBlob.size,
                includesImages: opts.includeImages,
                includesResources: opts.includeResources
            });

            return true;

        } catch (error) {
            console.error('ZIP导出失败:', error);
            throw error;
        }
    }

    /**
     * 添加资源文件到ZIP
     * @param {JSZip} zip - ZIP实例
     */
    async addResourcesToZip(zip) {
        const resourcesFolder = zip.folder('resources');

        // 添加CSS文件
        const currentTemplate = this.app.templateManager.getCurrentTemplate();
        try {
            const cssPath = this.app.templateManager.getTemplateCSSPath(currentTemplate);
            // 这里实际项目中需要读取CSS文件内容
            resourcesFolder.file('template.css', `/* 模板样式: ${currentTemplate} */`);
        } catch (error) {
            console.warn('CSS文件添加失败:', error);
        }

        // 添加JavaScript文件（如果需要）
        resourcesFolder.file('enhance.js', `
// 增强脚本
document.addEventListener('DOMContentLoaded', function() {
    console.log('文档已加载');

    // 添加代码复制功能
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        block.addEventListener('click', function() {
            navigator.clipboard.writeText(this.textContent);
        });
    });
});
        `.trim());
    }

    /**
     * 添加图片到ZIP
     * @param {JSZip} zip - ZIP实例
     */
    async addImagesToZip(zip) {
        const images = this.app.imageProcessor.getAllImages();

        if (images.length === 0) {
            return;
        }

        const imagesFolder = zip.folder('images');
        const imageMap = {};

        for (const image of images) {
            try {
                if (image.base64) {
                    // 从base64提取图片数据
                    const base64Data = image.base64.split(',')[1];
                    const mimeType = image.base64.match(/data:([^;]+)/)?.[1] || image.originalType;
                    const extension = this.getExtensionFromMimeType(mimeType);
                    const safeFileName = this.sanitizeFileName(image.fileName);
                    const imageFileName = `${safeFileName}.${extension}`;

                    imagesFolder.file(imageFileName, base64Data, { base64: true });
                    imageMap[image.id] = `images/${imageFileName}`;
                }
            } catch (error) {
                console.error(`图片添加失败: ${image.fileName}`, error);
            }
        }

        // 生成图片映射文件
        if (Object.keys(imageMap).length > 0) {
            zip.file('image-map.json', JSON.stringify(imageMap, null, 2));
        }
    }

    /**
     * 根据MIME类型获取文件扩展名
     * @param {string} mimeType - MIME类型
     * @returns {string} 扩展名
     */
    getExtensionFromMimeType(mimeType) {
        const mimeMap = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/svg+xml': 'svg'
        };

        return mimeMap[mimeType] || 'jpg';
    }

    /**
     * 清理文件名
     * @param {string} fileName - 原始文件名
     * @returns {string} 清理后的文件名
     */
    sanitizeFileName(fileName) {
        return fileName
            .replace(/[<>:"/\\|?*]/g, '_') // 替换非法字符
            .replace(/\s+/g, '_') // 替换空格
            .replace(/_+/g, '_') // 合并多个下划线
            .replace(/^_|_$/g, '') // 移除开头和结尾的下划线
            .substring(0, 50); // 限制长度
    }

    /**
     * 生成README内容
     * @returns {string} README内容
     */
    generateReadmeContent() {
        const stats = {
            words: this.app.markdownParser.getStats(this.app.currentMarkdown).words,
            images: this.app.imageProcessor.getAllImages().length,
            template: this.app.templateManager.getCurrentTemplate()
        };

        return `# 微信公众号文章导出包

## 文件说明

- **${this.getDocumentTitle()}.html**: 主要的HTML文档文件
- **images/**: 图片资源文件夹 (${stats.images} 张图片)
- **resources/**: 样式和脚本资源文件夹
- **metadata.json**: 文档元数据
- **image-map.json**: 图片文件映射关系

## 使用说明

1. 直接打开HTML文件即可在浏览器中查看文档
2. 如需发布到微信公众号，请复制HTML文件中的内容
3. 图片文件可根据需要上传到图床替换链接

## 文档信息

- 生成时间: ${new Date().toLocaleString('zh-CN')}
- 使用模板: ${stats.template}
- 文档字数: ${stats.words} 字
- 包含图片: ${stats.images} 张
- 生成工具: Markdown转微信公众号工具

## 注意事项

- 在微信公众号中使用时，建议先在草稿中预览效果
- 某些样式可能需要根据微信公众号的限制进行调整
- 图片链接需要使用有效的网络地址

---

Powered by Markdown转微信公众号工具
`;
    }

    /**
     * 生成元数据JSON
     * @returns {Object} 元数据对象
     */
    generateMetadataJSON() {
        return {
            title: this.getDocumentTitle(),
            exportTime: new Date().toISOString(),
            generator: {
                name: "Markdown转微信公众号工具",
                version: "1.0.0"
            },
            template: {
                name: this.app.templateManager.getCurrentTemplate(),
                displayName: this.app.templateManager.getTemplate(this.app.templateManager.getCurrentTemplate())?.name
            },
            statistics: {
                markdown: this.app.markdownParser.getStats(this.app.currentMarkdown),
                images: this.app.imageProcessor.getStats(),
                code: this.app.codeHighlighter.getCodeStats(this.app.currentMarkdown),
                math: this.app.mathRenderer.getMathStats(this.app.currentMarkdown),
                diagrams: this.app.diagramRenderer.getDiagramStats(this.app.currentMarkdown)
            },
            files: {
                originalMarkdown: this.app.currentMarkdown.length > 0,
                hasImages: this.app.imageProcessor.getAllImages().length > 0
            }
        };
    }

    /**
     * 下载文本文件
     * @param {string} content - 文件内容
     * @param {string} fileName - 文件名
     * @param {string} mimeType - MIME类型
     */
    downloadTextFile(content, fileName, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
        this.downloadBlob(blob, fileName);
    }

    /**
     * 下载Blob文件
     * @param {Blob} blob - Blob对象
     * @param {string} fileName - 文件名
     */
    downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // 清理URL对象
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * 记录导出历史
     * @param {Object} exportRecord - 导出记录
     */
    recordExport(exportRecord) {
        this.exportHistory.unshift(exportRecord);

        // 限制历史记录数量
        if (this.exportHistory.length > this.maxHistory) {
            this.exportHistory = this.exportHistory.slice(0, this.maxHistory);
        }

        // 存储到localStorage
        try {
            localStorage.setItem('export_history', JSON.stringify(this.exportHistory));
        } catch (error) {
            console.warn('导出历史存储失败:', error);
        }
    }

    /**
     * 获取导出历史
     * @returns {Array} 导出历史
     */
    getExportHistory() {
        if (this.exportHistory.length === 0) {
            // 尝试从localStorage加载
            try {
                const stored = localStorage.getItem('export_history');
                if (stored) {
                    this.exportHistory = JSON.parse(stored);
                }
            } catch (error) {
                console.warn('导出历史加载失败:', error);
            }
        }

        return this.exportHistory;
    }

    /**
     * 清理导出历史
     */
    clearExportHistory() {
        this.exportHistory = [];
        try {
            localStorage.removeItem('export_history');
        } catch (error) {
            console.warn('导出历史清理失败:', error);
        }
    }

    /**
     * 获取导出统计
     * @returns {Object} 统计信息
     */
    getExportStats() {
        const history = this.getExportHistory();
        const stats = {
            total: history.length,
            html: 0,
            zip: 0,
            totalSize: 0,
            lastExport: null
        };

        history.forEach(record => {
            stats[record.type] = (stats[record.type] || 0) + 1;
            stats.totalSize += record.size || 0;

            if (!stats.lastExport || record.timestamp > stats.lastExport) {
                stats.lastExport = record.timestamp;
            }
        });

        return stats;
    }
}