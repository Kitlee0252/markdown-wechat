// Markdown解析模块

class MarkdownParser {
    constructor() {
        this.mathRenderer = new MathRenderer();
        this.diagramRenderer = new DiagramRenderer();
        this.codeHighlighter = new CodeHighlighter();
        this.setupMarked();
    }

    /**
     * 设置marked.js配置
     */
    setupMarked() {
        // 配置marked选项
        marked.setOptions({
            gfm: true,              // 启用GitHub风格Markdown
            breaks: true,           // 支持换行符转换
            pedantic: false,        // 不严格遵循原始markdown.pl
            sanitize: false,        // 不进行HTML清理（我们使用DOMPurify）
            smartLists: true,       // 智能列表
            smartypants: false,     // 不使用智能标点
            xhtml: false            // 不产生XHTML
        });

        // 自定义渲染器
        const renderer = new marked.Renderer();

        // 自定义标题渲染
        renderer.heading = function(text, level) {
            return `<h${level} style="margin: 1.5em 0 0.8em 0; font-weight: bold; color: #333;">${text}</h${level}>\n`;
        };

        // 自定义段落渲染
        renderer.paragraph = function(text) {
            return `<p style="margin: 0.8em 0; line-height: 1.6; color: #333;">${text}</p>\n`;
        };

        // 自定义列表渲染
        renderer.list = function(body, ordered) {
            const type = ordered ? 'ol' : 'ul';
            const style = ordered ?
                'padding-left: 1.5em; margin: 0.8em 0;' :
                'padding-left: 1.5em; margin: 0.8em 0;';
            return `<${type} style="${style}">\n${body}</${type}>\n`;
        };

        renderer.listitem = function(text) {
            return `<li style="margin: 0.3em 0; line-height: 1.5;">${text}</li>\n`;
        };

        // 自定义引用渲染
        renderer.blockquote = function(quote) {
            return `<blockquote style="
                margin: 1em 0;
                padding: 0.8em 1em;
                border-left: 4px solid #ddd;
                background-color: #f9f9f9;
                color: #666;
                font-style: italic;
            ">\n${quote}</blockquote>\n`;
        };

        // 自定义代码块渲染 - 将由后续处理代码高亮
        renderer.code = function(code, language) {
            // 创建一个特殊标记，后续处理时会被代码高亮器替换
            return `<div class="code-placeholder" data-language="${language || ''}" data-code="${escapeBase64(code)}"></div>\n`;
        };

        // 自定义行内代码渲染 - 将由后续处理代码高亮
        renderer.codespan = function(code) {
            // 创建一个特殊标记，后续处理时会被代码高亮器替换
            return `<span class="inline-code-placeholder" data-code="${escapeBase64(code)}"></span>`;
        };

        // 自定义表格渲染
        renderer.table = function(header, body) {
            return `<table style="
                width: 100%;
                margin: 1em 0;
                border-collapse: collapse;
                font-size: 0.9em;
            ">
                <thead>${header}</thead>
                <tbody>${body}</tbody>
            </table>\n`;
        };

        renderer.tablerow = function(content) {
            return `<tr style="border-bottom: 1px solid #ddd;">${content}</tr>\n`;
        };

        renderer.tablecell = function(content, flags) {
            const type = flags.header ? 'th' : 'td';
            const align = flags.align ? ` style="text-align: ${flags.align};"` : '';
            const cellStyle = flags.header ?
                'padding: 0.6em; background-color: #f8f9fa; font-weight: bold; border: 1px solid #ddd;' :
                'padding: 0.6em; border: 1px solid #ddd;';

            return `<${type} style="${cellStyle}"${align}>${content}</${type}>\n`;
        };

        // 自定义链接渲染
        renderer.link = function(href, title, text) {
            const titleAttr = title ? ` title="${title}"` : '';
            return `<a href="${href}"${titleAttr} style="
                color: #007bff;
                text-decoration: none;
            " onmouseover="this.style.textDecoration='underline'"
               onmouseout="this.style.textDecoration='none'">${text}</a>`;
        };

        // 自定义图片渲染
        renderer.image = function(href, title, text) {
            const titleAttr = title ? ` title="${title}"` : '';
            const altAttr = text ? ` alt="${text}"` : '';
            return `<img src="${href}"${altAttr}${titleAttr} style="
                max-width: 100%;
                height: auto;
                margin: 1em 0;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            ">`;
        };

        // 自定义强调渲染
        renderer.strong = function(text) {
            return `<strong style="font-weight: bold; color: #333;">${text}</strong>`;
        };

        renderer.em = function(text) {
            return `<em style="font-style: italic; color: #666;">${text}</em>`;
        };

        // 自定义水平线渲染
        renderer.hr = function() {
            return `<hr style="
                margin: 2em 0;
                border: none;
                height: 1px;
                background-color: #ddd;
            ">\n`;
        };

        // 应用自定义渲染器
        marked.use({ renderer });

        // 辅助函数
        window.escapeBase64 = function(text) {
            try {
                return btoa(encodeURIComponent(text));
            } catch (error) {
                return encodeURIComponent(text);
            }
        };

        window.decodeBase64 = function(encoded) {
            try {
                return decodeURIComponent(atob(encoded));
            } catch (error) {
                return decodeURIComponent(encoded);
            }
        };
    }

    /**
     * 解析Markdown文本为HTML
     * @param {string} markdown - Markdown文本
     * @returns {string} HTML文本
     */
    async parse(markdown) {
        try {
            if (!markdown) return '';

            // 预处理数学公式
            const mathPreprocessed = this.mathRenderer.preprocessMath(markdown);

            // 预处理图表
            const diagramPreprocessed = this.diagramRenderer.preprocessDiagrams(mathPreprocessed.content);

            // 使用marked解析
            let html = marked.parse(diagramPreprocessed.content);

            // 恢复数学公式
            html = this.mathRenderer.restoreMath(html, mathPreprocessed.mathBlocks);

            // 恢复图表
            html = await this.diagramRenderer.restoreDiagrams(html, diagramPreprocessed.diagramBlocks);

            // 处理代码高亮
            html = this.processCodeHighlighting(html);

            // 使用DOMPurify进行安全清理
            if (typeof DOMPurify !== 'undefined') {
                html = DOMPurify.sanitize(html, {
                    ALLOWED_TAGS: [
                        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                        'p', 'br', 'strong', 'em', 'u', 'del',
                        'ol', 'ul', 'li',
                        'blockquote', 'pre', 'code',
                        'table', 'thead', 'tbody', 'tr', 'th', 'td',
                        'a', 'img',
                        'hr', 'div', 'span',
                        // KaTeX相关标签
                        'math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'mtext', 'mspace',
                        'mfrac', 'msup', 'msub', 'msubsup', 'mover', 'munder', 'munderover',
                        'msqrt', 'mroot', 'mtable', 'mtr', 'mtd', 'mpadded', 'mphantom',
                        'menclose', 'mfenced', 'annotation'
                    ],
                    ALLOWED_ATTR: [
                        'style', 'class', 'href', 'title', 'alt', 'src',
                        'onmouseover', 'onmouseout',
                        // KaTeX相关属性
                        'mathcolor', 'mathbackground', 'mathsize', 'mathvariant',
                        'accent', 'accentunder', 'align', 'alignmentscope',
                        'bevelled', 'close', 'columnalign', 'columnlines',
                        'columnspacing', 'denomination', 'depth', 'dir',
                        'display', 'displaystyle', 'edge', 'fence', 'frame',
                        'height', 'href', 'id', 'largeop', 'length', 'linethickness',
                        'lspace', 'lquote', 'mathcolor', 'mathsize', 'mathvariant',
                        'maxsize', 'minsize', 'movablelimits', 'notation',
                        'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing',
                        'rspace', 'rquote', 'scriptlevel', 'selection', 'separator',
                        'separators', 'stretchy', 'subscriptshift', 'superscriptshift',
                        'symmetric', 'voffset', 'width', 'xmlns'
                    ],
                    KEEP_CONTENT: true
                });
            }

            return html;
        } catch (error) {
            console.error('Markdown解析错误:', error);
            return `<p style="color: red;">解析错误: ${error.message}</p>`;
        }
    }

    /**
     * 处理代码高亮占位符
     * @param {string} html - HTML内容
     * @returns {string} 处理后的HTML
     */
    processCodeHighlighting(html) {
        try {
            // 处理代码块占位符
            html = html.replace(/<div class="code-placeholder" data-language="([^"]*)" data-code="([^"]*)"><\/div>/g, (match, language, encodedCode) => {
                try {
                    const code = window.decodeBase64(encodedCode);
                    return this.codeHighlighter.highlightCode(code, language);
                } catch (error) {
                    console.error('代码块处理失败:', error);
                    return `<pre style="background: #f4f4f4; padding: 1em; border-radius: 4px; overflow-x: auto;"><code>${encodedCode}</code></pre>`;
                }
            });

            // 处理行内代码占位符
            html = html.replace(/<span class="inline-code-placeholder" data-code="([^"]*)"><\/span>/g, (match, encodedCode) => {
                try {
                    const code = window.decodeBase64(encodedCode);
                    return this.codeHighlighter.highlightInlineCode(code);
                } catch (error) {
                    console.error('行内代码处理失败:', error);
                    return `<code style="background: #f1f1f1; padding: 0.2em 0.4em; border-radius: 3px;">${encodedCode}</code>`;
                }
            });

            return html;
        } catch (error) {
            console.error('代码高亮处理失败:', error);
            return html;
        }
    }

    /**
     * 预处理Markdown文本
     * @param {string} markdown - 原始Markdown文本
     * @returns {string} 预处理后的Markdown文本
     */
    preprocess(markdown) {
        if (!markdown) return '';

        // 处理数学公式（简单支持）
        markdown = markdown.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
            return `<div style="text-align: center; margin: 1em 0; font-family: serif; font-size: 1.1em;">${escapeHtml(formula)}</div>`;
        });

        markdown = markdown.replace(/\$([^$]+)\$/g, (match, formula) => {
            return `<span style="font-family: serif; font-style: italic;">${escapeHtml(formula)}</span>`;
        });

        // 处理任务列表
        markdown = markdown.replace(/^- \[x\] (.+)$/gm, '- ✅ $1');
        markdown = markdown.replace(/^- \[ \] (.+)$/gm, '- ⬜ $1');

        return markdown;
    }

    /**
     * 获取Markdown文档统计信息
     * @param {string} markdown - Markdown文本
     * @returns {Object} 统计信息
     */
    getStats(markdown) {
        if (!markdown) {
            return {
                words: 0,
                characters: 0,
                lines: 0,
                headings: 0,
                links: 0,
                images: 0
            };
        }

        const lines = markdown.split('\n').length;
        const characters = markdown.length;
        const words = countWords(markdown);

        // 统计标题数量
        const headings = (markdown.match(/^#+\s+/gm) || []).length;

        // 统计链接数量
        const links = (markdown.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length;

        // 统计图片数量
        const images = (markdown.match(/!\[([^\]]*)\]\([^)]+\)/g) || []).length;

        return {
            words,
            characters,
            lines,
            headings,
            links,
            images
        };
    }
}