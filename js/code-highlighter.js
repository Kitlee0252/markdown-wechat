// 代码高亮器（Prism.js）

class CodeHighlighter {
    constructor() {
        this.prismInitialized = false;

        // 支持的语言列表
        this.supportedLanguages = {
            'javascript': 'JavaScript',
            'js': 'JavaScript',
            'typescript': 'TypeScript',
            'ts': 'TypeScript',
            'python': 'Python',
            'py': 'Python',
            'java': 'Java',
            'c': 'C',
            'cpp': 'C++',
            'csharp': 'C#',
            'cs': 'C#',
            'php': 'PHP',
            'ruby': 'Ruby',
            'go': 'Go',
            'rust': 'Rust',
            'swift': 'Swift',
            'kotlin': 'Kotlin',
            'scala': 'Scala',
            'html': 'HTML',
            'xml': 'XML',
            'css': 'CSS',
            'scss': 'SCSS',
            'sass': 'Sass',
            'less': 'Less',
            'json': 'JSON',
            'yaml': 'YAML',
            'yml': 'YAML',
            'sql': 'SQL',
            'bash': 'Bash',
            'shell': 'Shell',
            'sh': 'Shell',
            'powershell': 'PowerShell',
            'dockerfile': 'Dockerfile',
            'markdown': 'Markdown',
            'md': 'Markdown',
            'r': 'R',
            'matlab': 'MATLAB',
            'latex': 'LaTeX',
            'vim': 'Vim',
            'diff': 'Diff',
            'git': 'Git',
            'regex': 'RegExp'
        };

        // 语言别名映射
        this.languageAliases = {
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'cs': 'csharp',
            'yml': 'yaml',
            'sh': 'bash',
            'md': 'markdown'
        };

        // 默认配置
        this.config = {
            theme: 'default',
            showLineNumbers: false,
            showLanguage: true,
            copyButton: false, // 微信不支持复制按钮
            maxLines: 50, // 最大行数限制
            wrapLines: true
        };
    }

    /**
     * 检查Prism是否可用
     * @returns {boolean} Prism是否可用
     */
    isPrismAvailable() {
        return typeof Prism !== 'undefined';
    }

    /**
     * 初始化Prism
     * @returns {boolean} 初始化是否成功
     */
    initPrism() {
        if (!this.isPrismAvailable()) {
            console.warn('Prism未加载，将使用基础代码高亮');
            return false;
        }

        if (this.prismInitialized) {
            return true;
        }

        try {
            // 设置自动加载器路径
            if (typeof Prism !== 'undefined' && Prism.plugins && Prism.plugins.autoloader) {
                Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/';
            }

            this.prismInitialized = true;
            return true;
        } catch (error) {
            console.error('Prism初始化失败:', error);
            return false;
        }
    }

    /**
     * 高亮代码块
     * @param {string} code - 代码内容
     * @param {string} language - 语言标识
     * @param {Object} options - 选项
     * @returns {string} 高亮后的HTML
     */
    highlightCode(code, language, options = {}) {
        const opts = { ...this.config, ...options };

        if (!code.trim()) {
            return this.createCodeBlock('', language, '暂无代码内容');
        }

        // 限制代码长度
        const lines = code.split('\n');
        if (lines.length > opts.maxLines) {
            const truncated = lines.slice(0, opts.maxLines).join('\n');
            const warning = `\n... (代码过长，已截断，共 ${lines.length} 行)`;
            code = truncated + warning;
        }

        // 规范化语言名
        const normalizedLanguage = this.normalizeLanguage(language);

        if (this.isPrismAvailable() && this.initPrism()) {
            try {
                return this.highlightWithPrism(code, normalizedLanguage, opts);
            } catch (error) {
                console.error('Prism高亮失败:', error);
                return this.highlightBasic(code, language, opts);
            }
        } else {
            return this.highlightBasic(code, language, opts);
        }
    }

    /**
     * 使用Prism进行高亮
     * @param {string} code - 代码内容
     * @param {string} language - 语言
     * @param {Object} options - 选项
     * @returns {string} 高亮后的HTML
     */
    highlightWithPrism(code, language, options) {
        try {
            let highlightedCode;

            // 检查语言是否支持
            if (Prism.languages[language]) {
                highlightedCode = Prism.highlight(code, Prism.languages[language], language);
            } else {
                // 如果语言不支持，使用纯文本
                highlightedCode = this.escapeHtml(code);
            }

            return this.createCodeBlock(highlightedCode, language, null, options);
        } catch (error) {
            console.error(`Prism高亮失败 (${language}):`, error);
            return this.highlightBasic(code, language, options);
        }
    }

    /**
     * 基础代码高亮（不使用Prism）
     * @param {string} code - 代码内容
     * @param {string} language - 语言
     * @param {Object} options - 选项
     * @returns {string} 高亮后的HTML
     */
    highlightBasic(code, language, options) {
        // 基础高亮：关键字、字符串、注释
        let highlighted = this.escapeHtml(code);

        // 简单的语法高亮规则
        const highlightRules = this.getBasicHighlightRules(language);

        highlightRules.forEach(rule => {
            highlighted = highlighted.replace(rule.pattern, rule.replacement);
        });

        return this.createCodeBlock(highlighted, language, null, options);
    }

    /**
     * 获取基础高亮规则
     * @param {string} language - 语言
     * @returns {Array} 高亮规则
     */
    getBasicHighlightRules(language) {
        const rules = [];

        // JavaScript/TypeScript 关键字
        if (['javascript', 'js', 'typescript', 'ts'].includes(language)) {
            rules.push({
                pattern: /\b(const|let|var|function|return|if|else|for|while|class|extends|import|export|from|async|await|try|catch|finally)\b/g,
                replacement: '<span style="color: #d73a49; font-weight: bold;">$1</span>'
            });
            rules.push({
                pattern: /(\/\/.*$)/gm,
                replacement: '<span style="color: #6a737d; font-style: italic;">$1</span>'
            });
            rules.push({
                pattern: /(['"`].*?['"`])/g,
                replacement: '<span style="color: #032f62;">$1</span>'
            });
        }

        // Python 关键字
        if (['python', 'py'].includes(language)) {
            rules.push({
                pattern: /\b(def|class|import|from|return|if|elif|else|for|while|try|except|finally|with|as|pass|break|continue)\b/g,
                replacement: '<span style="color: #d73a49; font-weight: bold;">$1</span>'
            });
            rules.push({
                pattern: /(#.*$)/gm,
                replacement: '<span style="color: #6a737d; font-style: italic;">$1</span>'
            });
            rules.push({
                pattern: /(['"`].*?['"`])/g,
                replacement: '<span style="color: #032f62;">$1</span>'
            });
        }

        // CSS
        if (['css', 'scss', 'sass', 'less'].includes(language)) {
            rules.push({
                pattern: /([.#]?[\w-]+)\s*\{/g,
                replacement: '<span style="color: #6f42c1;">$1</span>{'
            });
            rules.push({
                pattern: /([\w-]+)\s*:/g,
                replacement: '<span style="color: #e36209;">$1</span>:'
            });
        }

        // HTML/XML
        if (['html', 'xml'].includes(language)) {
            rules.push({
                pattern: /(&lt;\/?)(\w+)([^&]*?)(&gt;)/g,
                replacement: '<span style="color: #22863a;">$1</span><span style="color: #6f42c1;">$2</span><span style="color: #032f62;">$3</span><span style="color: #22863a;">$4</span>'
            });
        }

        return rules;
    }

    /**
     * 创建代码块HTML
     * @param {string} highlightedCode - 高亮后的代码
     * @param {string} language - 语言
     * @param {string} error - 错误信息
     * @param {Object} options - 选项
     * @returns {string} 代码块HTML
     */
    createCodeBlock(highlightedCode, language, error, options = {}) {
        const opts = { ...this.config, ...options };
        const languageDisplay = this.supportedLanguages[language] || language || 'Text';

        let headerHtml = '';
        if (opts.showLanguage) {
            headerHtml = `
                <div class="code-header" style="background: linear-gradient(90deg, #f6f8fa, #e1e4e8); padding: 0.5em 1em; border-bottom: 1px solid #e1e4e8; font-size: 0.85em; color: #586069; font-weight: 500; border-radius: 6px 6px 0 0;">
                    <span class="code-language">📄 ${languageDisplay}</span>
                </div>
            `;
        }

        let codeHtml;
        if (error) {
            codeHtml = `
                <div style="color: #d73a49; background: #ffeaea; padding: 1em; font-family: monospace; font-size: 0.9em;">
                    <strong>代码高亮错误:</strong> ${error}
                </div>
            `;
        } else {
            const lineNumbersHtml = opts.showLineNumbers ? this.generateLineNumbers(highlightedCode) : '';
            const codeContainerStyle = opts.showLineNumbers ? 'display: flex;' : '';

            codeHtml = `
                <div class="code-container" style="${codeContainerStyle}">
                    ${lineNumbersHtml}
                    <pre class="code-content" style="margin: 0; padding: 1em; overflow-x: auto; flex: 1; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace; font-size: 0.85em; line-height: 1.4; background-color: #f6f8fa; color: #24292e; ${opts.wrapLines ? 'white-space: pre-wrap; word-wrap: break-word;' : 'white-space: pre;'}"><code class="language-${language}">${highlightedCode}</code></pre>
                </div>
            `;
        }

        return `
            <div class="code-block" style="margin: 1.5em 0; border: 1px solid #e1e4e8; border-radius: 6px; overflow: hidden; background-color: #ffffff;">
                ${headerHtml}
                ${codeHtml}
            </div>
        `;
    }

    /**
     * 生成行号
     * @param {string} code - 代码内容
     * @returns {string} 行号HTML
     */
    generateLineNumbers(code) {
        const lines = code.split('\n');
        const lineNumbers = lines.map((_, index) => index + 1).join('\n');

        return `
            <div class="code-line-numbers" style="background-color: #f0f0f0; padding: 1em 0.5em; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace; font-size: 0.85em; line-height: 1.4; color: #666; text-align: right; border-right: 1px solid #e1e4e8; min-width: ${String(lines.length).length + 1}em;">
                <pre style="margin: 0;">${lineNumbers}</pre>
            </div>
        `;
    }

    /**
     * 规范化语言名称
     * @param {string} language - 原始语言名
     * @returns {string} 规范化后的语言名
     */
    normalizeLanguage(language) {
        if (!language) return 'text';

        const lower = language.toLowerCase();
        return this.languageAliases[lower] || lower;
    }

    /**
     * 转义HTML字符
     * @param {string} text - 文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 处理内联代码
     * @param {string} code - 代码内容
     * @returns {string} 处理后的HTML
     */
    highlightInlineCode(code) {
        const escaped = this.escapeHtml(code);
        return `<code style="background-color: #f3f4f6; padding: 0.2em 0.4em; border-radius: 3px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace; font-size: 0.9em; color: #e73c7e; border: 1px solid #e5e7eb;">${escaped}</code>`;
    }

    /**
     * 批量处理代码块
     * @param {string} content - 包含代码块的内容
     * @returns {string} 处理后的内容
     */
    processCodeBlocks(content) {
        // 处理围栏代码块
        const fencedCodeRegex = /```(\w+)?\n([\s\S]*?)\n```/g;

        return content.replace(fencedCodeRegex, (match, language, code) => {
            return this.highlightCode(code, language || 'text');
        });
    }

    /**
     * 适配微信样式
     * @param {string} highlightedCode - 高亮后的代码HTML
     * @returns {string} 适配后的HTML
     */
    adaptForWeChat(highlightedCode) {
        // 确保所有样式都内联，移除可能被微信过滤的属性
        let adapted = highlightedCode;

        // 移除可能有问题的类名，保留内联样式
        adapted = adapted.replace(/class="[^"]*"/g, '');

        // 确保代码块在微信中正确显示
        adapted = adapted.replace(/<div class="code-block"/g, '<div style="display: block; margin: 1em 0; overflow-x: auto;"');

        return adapted;
    }

    /**
     * 获取代码统计信息
     * @param {string} content - 内容
     * @returns {Object} 统计信息
     */
    getCodeStats(content) {
        const fencedMatches = content.match(/```(\w+)?\n([\s\S]*?)\n```/g) || [];
        const inlineMatches = content.match(/`[^`\n]+`/g) || [];

        const languages = {};
        fencedMatches.forEach(match => {
            const languageMatch = match.match(/```(\w+)?/);
            const language = languageMatch ? (languageMatch[1] || 'text') : 'text';
            languages[language] = (languages[language] || 0) + 1;
        });

        return {
            fencedBlocks: fencedMatches.length,
            inlineCode: inlineMatches.length,
            languages: languages,
            total: fencedMatches.length + inlineMatches.length,
            hasPrism: this.isPrismAvailable()
        };
    }

    /**
     * 验证代码语法（基础检查）
     * @param {string} code - 代码内容
     * @param {string} language - 语言
     * @returns {Object} 验证结果
     */
    validateCode(code, language) {
        const stats = {
            isValid: true,
            warnings: [],
            errors: []
        };

        // 基础检查
        if (!code.trim()) {
            stats.warnings.push('代码内容为空');
            return stats;
        }

        const lines = code.split('\n');
        if (lines.length > this.config.maxLines) {
            stats.warnings.push(`代码行数过多 (${lines.length} > ${this.config.maxLines})`);
        }

        // 语言特定检查
        if (language === 'json') {
            try {
                JSON.parse(code);
            } catch (error) {
                stats.errors.push('JSON 语法错误: ' + error.message);
                stats.isValid = false;
            }
        }

        return stats;
    }
}