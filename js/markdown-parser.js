// Markdown解析模块

class MarkdownParser {
    constructor() {
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

        // 自定义代码块渲染
        renderer.code = function(code, language) {
            const langClass = language ? ` class="language-${language}"` : '';
            return `<pre style="
                margin: 1em 0;
                padding: 1em;
                background-color: #f4f4f4;
                border-radius: 4px;
                overflow-x: auto;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 0.9em;
                line-height: 1.4;
            "><code${langClass}>${escapeHtml(code)}</code></pre>\n`;
        };

        // 自定义行内代码渲染
        renderer.codespan = function(code) {
            return `<code style="
                padding: 0.2em 0.4em;
                background-color: #f1f1f1;
                border-radius: 3px;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 0.9em;
                color: #e83e8c;
            ">${escapeHtml(code)}</code>`;
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
    }

    /**
     * 解析Markdown文本为HTML
     * @param {string} markdown - Markdown文本
     * @returns {string} HTML文本
     */
    parse(markdown) {
        try {
            if (!markdown) return '';

            // 使用marked解析
            let html = marked.parse(markdown);

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
                        'hr', 'div', 'span'
                    ],
                    ALLOWED_ATTR: [
                        'style', 'class', 'href', 'title', 'alt', 'src',
                        'onmouseover', 'onmouseout'
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