// 微信适配模块

class WeChatAdapter {
    constructor() {
        this.inlineStyles = true;
        this.removeUnsafeAttributes = true;
    }

    /**
     * 将HTML适配为微信公众号格式
     * @param {string} html - 原始HTML
     * @param {string} template - 样式模板
     * @returns {string} 适配后的HTML
     */
    adapt(html, template = 'minimal') {
        if (!html) return '';

        try {
            // 创建临时DOM元素进行处理
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            // 应用样式模板
            this.applyTemplate(tempDiv, template);

            // 内联所有样式
            if (this.inlineStyles) {
                this.inlineAllStyles(tempDiv);
            }

            // 移除不安全的属性
            if (this.removeUnsafeAttributes) {
                this.removeUnsafeAttrs(tempDiv);
            }

            // 优化微信兼容性
            this.optimizeForWeChat(tempDiv);

            return tempDiv.innerHTML;
        } catch (error) {
            console.error('微信适配错误:', error);
            return html;
        }
    }

    /**
     * 应用样式模板
     * @param {Element} container - 容器元素
     * @param {string} template - 模板名称
     */
    applyTemplate(container, template) {
        const styles = this.getTemplateStyles(template);

        // 应用全局样式
        if (styles.global) {
            container.style.cssText = styles.global;
        }

        // 应用元素特定样式
        Object.keys(styles).forEach(selector => {
            if (selector === 'global') return;

            const elements = container.querySelectorAll(selector);
            elements.forEach(el => {
                if (typeof styles[selector] === 'string') {
                    el.style.cssText += '; ' + styles[selector];
                }
            });
        });
    }

    /**
     * 获取模板样式
     * @param {string} template - 模板名称
     * @returns {Object} 样式对象
     */
    getTemplateStyles(template) {
        const templates = {
            minimal: {
                global: `
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    font-size: 16px;
                    line-height: 1.6;
                    color: #333;
                    max-width: 100%;
                    margin: 0;
                    padding: 20px;
                `,
                'h1, h2, h3, h4, h5, h6': `
                    color: #2c3e50;
                    margin: 1.2em 0 0.8em 0;
                    font-weight: 600;
                `,
                'h1': 'font-size: 1.8em; border-bottom: 2px solid #3498db; padding-bottom: 0.3em;',
                'h2': 'font-size: 1.5em; border-bottom: 1px solid #bdc3c7; padding-bottom: 0.2em;',
                'h3': 'font-size: 1.3em;',
                'p': `
                    margin: 0.8em 0;
                    line-height: 1.7;
                `,
                'blockquote': `
                    border-left: 4px solid #3498db;
                    background-color: #f8f9fa;
                    padding: 0.8em 1.2em;
                    margin: 1em 0;
                    font-style: italic;
                    color: #555;
                `,
                'code': `
                    background-color: #f1f2f6;
                    padding: 0.2em 0.4em;
                    border-radius: 3px;
                    font-family: Monaco, Consolas, monospace;
                    font-size: 0.9em;
                    color: #e74c3c;
                `,
                'pre': `
                    background-color: #2c3e50;
                    color: #ecf0f1;
                    padding: 1em;
                    border-radius: 5px;
                    overflow-x: auto;
                    margin: 1em 0;
                `,
                'pre code': `
                    background-color: transparent;
                    color: inherit;
                    padding: 0;
                `
            },

            tech: {
                global: `
                    font-family: "SF Pro Text", -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
                    font-size: 15px;
                    line-height: 1.6;
                    color: #24292e;
                    max-width: 100%;
                    margin: 0;
                    padding: 20px;
                    background-color: #ffffff;
                `,
                'h1, h2, h3, h4, h5, h6': `
                    color: #1a202c;
                    margin: 1.5em 0 0.8em 0;
                    font-weight: 700;
                `,
                'h1': `
                    font-size: 2em;
                    border-bottom: 3px solid #4299e1;
                    padding-bottom: 0.3em;
                `,
                'h2': `
                    font-size: 1.6em;
                    border-bottom: 2px solid #68d391;
                    padding-bottom: 0.2em;
                `,
                'h3': `
                    font-size: 1.3em;
                    color: #2d3748;
                `,
                'p': `
                    margin: 0.9em 0;
                    line-height: 1.8;
                `,
                'blockquote': `
                    border-left: 5px solid #4299e1;
                    background: linear-gradient(90deg, #ebf8ff 0%, #ffffff 100%);
                    padding: 1em 1.5em;
                    margin: 1.2em 0;
                    position: relative;
                `,
                'code': `
                    background-color: #edf2f7;
                    border: 1px solid #e2e8f0;
                    padding: 0.25em 0.5em;
                    border-radius: 4px;
                    font-family: "SF Mono", Monaco, Consolas, monospace;
                    font-size: 0.875em;
                    color: #d73a49;
                `,
                'pre': `
                    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
                    color: #f7fafc;
                    padding: 1.2em;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    margin: 1.2em 0;
                    overflow-x: auto;
                `,
                'pre code': `
                    background-color: transparent;
                    border: none;
                    color: inherit;
                    padding: 0;
                `
            },

            academic: {
                global: `
                    font-family: "Times New Roman", Georgia, serif;
                    font-size: 16px;
                    line-height: 1.8;
                    color: #2c3e50;
                    max-width: 100%;
                    margin: 0;
                    padding: 30px;
                `,
                'h1, h2, h3, h4, h5, h6': `
                    color: #34495e;
                    margin: 2em 0 1em 0;
                    font-weight: 600;
                    text-align: center;
                `,
                'h1': `
                    font-size: 2.2em;
                    border-bottom: 3px double #8e44ad;
                    padding-bottom: 0.5em;
                    margin-bottom: 1.5em;
                `,
                'h2': `
                    font-size: 1.8em;
                    border-bottom: 1px solid #9b59b6;
                    padding-bottom: 0.3em;
                `,
                'h3': `
                    font-size: 1.4em;
                    font-style: italic;
                `,
                'p': `
                    margin: 1.2em 0;
                    line-height: 2;
                    text-align: justify;
                    text-indent: 2em;
                `,
                'blockquote': `
                    border-left: 4px solid #9b59b6;
                    background-color: #faf5ff;
                    padding: 1.2em 2em;
                    margin: 1.5em 0;
                    font-style: italic;
                    position: relative;
                `,
                'code': `
                    background-color: #f8f8ff;
                    border: 1px solid #e1e1e8;
                    padding: 0.3em 0.6em;
                    border-radius: 4px;
                    font-family: "Courier New", monospace;
                    font-size: 0.9em;
                    color: #6f42c1;
                `,
                'pre': `
                    background-color: #f8f8ff;
                    border: 2px solid #e1e1e8;
                    padding: 1.5em;
                    border-radius: 8px;
                    margin: 1.5em 0;
                    font-family: "Courier New", monospace;
                    line-height: 1.6;
                `,
                'ul, ol': `
                    padding-left: 2em;
                    margin: 1em 0;
                `,
                'li': `
                    margin: 0.5em 0;
                    line-height: 1.8;
                `
            }
        };

        return templates[template] || templates.minimal;
    }

    /**
     * 内联所有样式
     * @param {Element} container - 容器元素
     */
    inlineAllStyles(container) {
        // 确保所有样式都是内联的，因为微信会清除外部CSS
        const elements = container.querySelectorAll('*');
        elements.forEach(el => {
            if (el.style.cssText) {
                // 样式已经是内联的，确保重要属性
                el.style.cssText = el.style.cssText.replace(/;/g, ' !important;');
            }
        });
    }

    /**
     * 移除不安全的属性
     * @param {Element} container - 容器元素
     */
    removeUnsafeAttrs(container) {
        const unsafeAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout'];
        const elements = container.querySelectorAll('*');

        elements.forEach(el => {
            unsafeAttrs.forEach(attr => {
                if (el.hasAttribute(attr)) {
                    el.removeAttribute(attr);
                }
            });
        });
    }

    /**
     * 优化微信兼容性
     * @param {Element} container - 容器元素
     */
    optimizeForWeChat(container) {
        // 处理图片
        const images = container.querySelectorAll('img');
        images.forEach(img => {
            // 确保图片样式
            img.style.cssText += '; max-width: 100% !important; height: auto !important; display: block !important;';

            // 如果没有alt属性，添加默认值
            if (!img.getAttribute('alt')) {
                img.setAttribute('alt', '图片');
            }
        });

        // 处理链接
        const links = container.querySelectorAll('a');
        links.forEach(link => {
            // 移除target属性，微信不支持
            link.removeAttribute('target');

            // 确保链接样式
            link.style.cssText += '; text-decoration: underline !important;';
        });

        // 处理表格
        const tables = container.querySelectorAll('table');
        tables.forEach(table => {
            table.style.cssText += '; width: 100% !important; border-collapse: collapse !important;';

            // 确保表格单元格有边框
            const cells = table.querySelectorAll('td, th');
            cells.forEach(cell => {
                cell.style.cssText += '; border: 1px solid #ddd !important; padding: 8px !important;';
            });
        });

        // 处理代码块
        const codeBlocks = container.querySelectorAll('pre');
        codeBlocks.forEach(pre => {
            pre.style.cssText += '; white-space: pre-wrap !important; word-wrap: break-word !important;';
        });
    }

    /**
     * 获取纯HTML（用于复制）
     * @param {string} adaptedHtml - 适配后的HTML
     * @returns {string} 纯HTML字符串
     */
    getCleanHtml(adaptedHtml) {
        return adaptedHtml;
    }

    /**
     * 检查HTML是否适合微信
     * @param {string} html - HTML内容
     * @returns {Object} 检查结果
     */
    validateForWeChat(html) {
        const issues = [];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // 检查不支持的标签
        const unsupportedTags = ['script', 'style', 'iframe', 'form', 'input', 'button'];
        unsupportedTags.forEach(tag => {
            if (tempDiv.querySelector(tag)) {
                issues.push(`发现不支持的标签: ${tag}`);
            }
        });

        // 检查外部资源
        const externalImages = tempDiv.querySelectorAll('img[src^="http"]');
        if (externalImages.length > 0) {
            issues.push(`发现 ${externalImages.length} 个外部图片，可能无法在微信中显示`);
        }

        return {
            isValid: issues.length === 0,
            issues: issues,
            warnings: []
        };
    }
}