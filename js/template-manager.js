// 模板管理器

class TemplateManager {
    constructor() {
        this.currentTemplate = 'minimal';
        this.templates = this.initializeTemplates();
    }

    /**
     * 初始化模板定义
     * @returns {Object} 模板对象
     */
    initializeTemplates() {
        return {
            minimal: {
                name: '极简风格',
                description: '简洁清爽，适合日常文章',
                preview: `
                    <div style="font-family: -apple-system, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 0.3em;">示例标题</h2>
                        <p style="line-height: 1.7; margin: 0.8em 0;">这是极简风格的示例文本，简洁清爽。</p>
                        <blockquote style="border-left: 4px solid #3498db; background: #f8f9fa; padding: 0.8em 1.2em; font-style: italic;">
                            这是引用文本
                        </blockquote>
                    </div>
                `,
                config: {
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    accentColor: '#3498db',
                    backgroundColor: '#ffffff'
                }
            },

            tech: {
                name: '技术风格',
                description: '专业技术感，适合技术文章',
                preview: `
                    <div style="font-family: SF Pro Text, sans-serif; padding: 20px; color: #24292e;">
                        <h2 style="color: #1a202c; border-bottom: 2px solid #4299e1; padding-bottom: 0.2em;">技术标题</h2>
                        <p style="line-height: 1.8; margin: 0.9em 0;">这是技术风格的示例，具有现代感。</p>
                        <code style="background: #edf2f7; padding: 0.25em 0.5em; border-radius: 4px; color: #d73a49;">console.log('hello')</code>
                    </div>
                `,
                config: {
                    fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    accentColor: '#4299e1',
                    backgroundColor: '#ffffff'
                }
            },

            academic: {
                name: '学术风格',
                description: '严谨学术风，适合学术论文',
                preview: `
                    <div style="font-family: Times New Roman, Georgia, serif; padding: 30px; color: #2c3e50;">
                        <h2 style="color: #34495e; text-align: center; border-bottom: 1px solid #9b59b6; padding-bottom: 0.3em;">学术标题</h2>
                        <p style="line-height: 2; text-align: justify; text-indent: 2em;">这是学术风格的示例文本，具有正式的学术感。</p>
                        <blockquote style="border-left: 4px solid #9b59b6; background: #faf5ff; padding: 1.2em 2em; font-style: italic;">
                            学术引用文本
                        </blockquote>
                    </div>
                `,
                config: {
                    fontFamily: '"Times New Roman", Georgia, serif',
                    fontSize: '16px',
                    lineHeight: '1.8',
                    accentColor: '#9b59b6',
                    backgroundColor: '#ffffff'
                }
            }
        };
    }

    /**
     * 获取模板列表
     * @returns {Array} 模板列表
     */
    getTemplateList() {
        return Object.keys(this.templates).map(key => ({
            key: key,
            name: this.templates[key].name,
            description: this.templates[key].description
        }));
    }

    /**
     * 获取模板信息
     * @param {string} templateKey - 模板键
     * @returns {Object|null} 模板信息
     */
    getTemplate(templateKey) {
        return this.templates[templateKey] || null;
    }

    /**
     * 设置当前模板
     * @param {string} templateKey - 模板键
     * @returns {boolean} 设置是否成功
     */
    setCurrentTemplate(templateKey) {
        if (this.templates[templateKey]) {
            this.currentTemplate = templateKey;
            return true;
        }
        return false;
    }

    /**
     * 获取当前模板
     * @returns {string} 当前模板键
     */
    getCurrentTemplate() {
        return this.currentTemplate;
    }

    /**
     * 获取模板预览HTML
     * @param {string} templateKey - 模板键
     * @returns {string} 预览HTML
     */
    getTemplatePreview(templateKey) {
        const template = this.getTemplate(templateKey);
        return template ? template.preview : '';
    }

    /**
     * 创建自定义模板（暂未实现）
     * @param {string} name - 模板名称
     * @param {Object} config - 模板配置
     * @returns {string} 新模板的键
     */
    createCustomTemplate(name, config) {
        // 这里可以扩展自定义模板功能
        const key = 'custom_' + generateId();
        this.templates[key] = {
            name: name,
            description: '自定义模板',
            config: config,
            custom: true
        };
        return key;
    }

    /**
     * 删除自定义模板
     * @param {string} templateKey - 模板键
     * @returns {boolean} 删除是否成功
     */
    deleteCustomTemplate(templateKey) {
        if (this.templates[templateKey] && this.templates[templateKey].custom) {
            delete this.templates[templateKey];
            if (this.currentTemplate === templateKey) {
                this.currentTemplate = 'minimal';
            }
            return true;
        }
        return false;
    }

    /**
     * 导出模板配置
     * @param {string} templateKey - 模板键
     * @returns {Object} 模板配置
     */
    exportTemplate(templateKey) {
        const template = this.getTemplate(templateKey);
        if (template) {
            return {
                name: template.name,
                description: template.description,
                config: template.config,
                version: '1.0.0',
                exported: new Date().toISOString()
            };
        }
        return null;
    }

    /**
     * 导入模板配置
     * @param {Object} templateData - 模板数据
     * @returns {string|null} 新模板的键，失败返回null
     */
    importTemplate(templateData) {
        try {
            if (!templateData.name || !templateData.config) {
                throw new Error('模板数据不完整');
            }

            const key = 'imported_' + generateId();
            this.templates[key] = {
                name: templateData.name,
                description: templateData.description || '导入的模板',
                config: templateData.config,
                custom: true,
                imported: true
            };

            return key;
        } catch (error) {
            console.error('导入模板失败:', error);
            return null;
        }
    }

    /**
     * 获取模板的CSS文件路径
     * @param {string} templateKey - 模板键
     * @returns {string} CSS文件路径
     */
    getTemplateCSSPath(templateKey) {
        return `css/templates/${templateKey}.css`;
    }

    /**
     * 动态加载模板CSS文件
     * @param {string} templateKey - 模板键
     * @returns {Promise<boolean>} 加载是否成功
     */
    async loadTemplateCSS(templateKey) {
        return new Promise((resolve) => {
            // 移除之前的模板样式
            const existingLink = document.querySelector('link[data-template]');
            if (existingLink) {
                existingLink.remove();
            }

            // 创建新的样式链接
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = this.getTemplateCSSPath(templateKey);
            link.setAttribute('data-template', templateKey);

            link.onload = () => resolve(true);
            link.onerror = () => {
                console.warn(`模板CSS文件加载失败: ${templateKey}`);
                resolve(false);
            };

            document.head.appendChild(link);
        });
    }

    /**
     * 获取模板的CSS样式（保留作为备用方法）
     * @param {string} templateKey - 模板键
     * @returns {string} CSS样式字符串
     */
    getTemplateCSS(templateKey) {
        const template = this.getTemplate(templateKey);
        if (!template || !template.config) return '';

        const config = template.config;

        return `
            .wechat-content {
                font-family: ${config.fontFamily};
                font-size: ${config.fontSize};
                line-height: ${config.lineHeight};
                background-color: ${config.backgroundColor};
                max-width: 100%;
                margin: 0;
                padding: 20px;
            }

            .wechat-content h1,
            .wechat-content h2,
            .wechat-content h3,
            .wechat-content h4,
            .wechat-content h5,
            .wechat-content h6 {
                color: ${config.accentColor};
                margin: 1.5em 0 0.8em 0;
                font-weight: bold;
            }

            .wechat-content p {
                margin: 0.8em 0;
                line-height: ${config.lineHeight};
            }

            .wechat-content blockquote {
                border-left: 4px solid ${config.accentColor};
                padding: 0.8em 1.2em;
                margin: 1em 0;
                background-color: rgba(${this.hexToRgb(config.accentColor)}, 0.1);
            }
        `;
    }

    /**
     * 转换十六进制颜色为RGB
     * @param {string} hex - 十六进制颜色值
     * @returns {string} RGB值字符串
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ?
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
            '0, 0, 0';
    }

    /**
     * 保存模板配置到localStorage
     */
    saveToLocalStorage() {
        try {
            const data = {
                currentTemplate: this.currentTemplate,
                customTemplates: {}
            };

            // 只保存自定义模板
            Object.keys(this.templates).forEach(key => {
                if (this.templates[key].custom) {
                    data.customTemplates[key] = this.templates[key];
                }
            });

            localStorage.setItem('wechat_templates', JSON.stringify(data));
        } catch (error) {
            console.error('保存模板配置失败:', error);
        }
    }

    /**
     * 从localStorage加载模板配置
     */
    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('wechat_templates');
            if (data) {
                const parsed = JSON.parse(data);

                // 恢复当前模板
                if (parsed.currentTemplate && this.templates[parsed.currentTemplate]) {
                    this.currentTemplate = parsed.currentTemplate;
                }

                // 恢复自定义模板
                if (parsed.customTemplates) {
                    Object.keys(parsed.customTemplates).forEach(key => {
                        this.templates[key] = parsed.customTemplates[key];
                    });
                }
            }
        } catch (error) {
            console.error('加载模板配置失败:', error);
        }
    }
}