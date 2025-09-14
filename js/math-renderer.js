// 数学公式渲染器

class MathRenderer {
    constructor() {
        this.katexOptions = {
            displayMode: false,
            throwOnError: false,
            errorColor: '#cc0000',
            strict: false,
            output: 'htmlAndMathml',
            fleqn: false,
            macros: {
                // 添加一些常用数学宏定义
                "\\RR": "\\mathbb{R}",
                "\\CC": "\\mathbb{C}",
                "\\NN": "\\mathbb{N}",
                "\\ZZ": "\\mathbb{Z}",
                "\\QQ": "\\mathbb{Q}",
                "\\implies": "\\Rightarrow",
                "\\iff": "\\Leftrightarrow",
                "\\land": "\\wedge",
                "\\lor": "\\vee",
                "\\lnot": "\\neg"
            }
        };

        this.inlineMathRegex = /\$([^$\n]+?)\$/g;
        this.blockMathRegex = /\$\$\n?([\s\S]+?)\n?\$\$/g;
        this.latexBlockRegex = /\\begin\{([a-z*]+)\}([\s\S]*?)\\end\{\1\}/g;
    }

    /**
     * 检查KaTeX是否可用
     * @returns {boolean} KaTeX是否可用
     */
    isKatexAvailable() {
        return typeof katex !== 'undefined';
    }

    /**
     * 渲染数学公式
     * @param {string} content - 包含数学公式的内容
     * @returns {string} 渲染后的内容
     */
    renderMath(content) {
        if (!this.isKatexAvailable()) {
            console.warn('KaTeX未加载，跳过数学公式渲染');
            return content;
        }

        try {
            // 先处理块级公式
            content = this.renderBlockMath(content);

            // 再处理行内公式
            content = this.renderInlineMath(content);

            // 处理LaTeX环境（如align, equation等）
            content = this.renderLatexEnvironments(content);

            return content;
        } catch (error) {
            console.error('数学公式渲染失败:', error);
            return content;
        }
    }

    /**
     * 渲染块级数学公式
     * @param {string} content - 内容
     * @returns {string} 渲染后的内容
     */
    renderBlockMath(content) {
        return content.replace(this.blockMathRegex, (match, math) => {
            try {
                const rendered = katex.renderToString(math.trim(), {
                    ...this.katexOptions,
                    displayMode: true
                });

                // 包装在div中，添加微信适配的样式
                return `<div class="math-block" style="text-align: center; margin: 1em 0; overflow-x: auto;">${rendered}</div>`;
            } catch (error) {
                console.error('块级公式渲染失败:', error);
                return `<div class="math-error" style="color: #cc0000; background: #fff2f2; padding: 0.5em; border: 1px solid #ffcccc; border-radius: 3px; margin: 1em 0;"><strong>数学公式错误:</strong> ${error.message}<br><code>${math}</code></div>`;
            }
        });
    }

    /**
     * 渲染行内数学公式
     * @param {string} content - 内容
     * @returns {string} 渲染后的内容
     */
    renderInlineMath(content) {
        return content.replace(this.inlineMathRegex, (match, math) => {
            try {
                const rendered = katex.renderToString(math.trim(), {
                    ...this.katexOptions,
                    displayMode: false
                });

                // 包装在span中，添加微信适配的样式
                return `<span class="math-inline" style="display: inline-block; vertical-align: middle;">${rendered}</span>`;
            } catch (error) {
                console.error('行内公式渲染失败:', error);
                return `<span class="math-error" style="color: #cc0000; background: #fff2f2; padding: 0.1em 0.3em; border-radius: 2px;"><strong>错误:</strong> ${math}</span>`;
            }
        });
    }

    /**
     * 渲染LaTeX环境
     * @param {string} content - 内容
     * @returns {string} 渲染后的内容
     */
    renderLatexEnvironments(content) {
        return content.replace(this.latexBlockRegex, (match, env, body) => {
            try {
                const fullLatex = `\\begin{${env}}${body}\\end{${env}}`;
                const rendered = katex.renderToString(fullLatex, {
                    ...this.katexOptions,
                    displayMode: true
                });

                return `<div class="math-environment" style="text-align: center; margin: 1.5em 0; overflow-x: auto;">${rendered}</div>`;
            } catch (error) {
                console.error('LaTeX环境渲染失败:', error);
                return `<div class="math-error" style="color: #cc0000; background: #fff2f2; padding: 0.5em; border: 1px solid #ffcccc; border-radius: 3px; margin: 1em 0;"><strong>LaTeX环境错误:</strong> ${error.message}<br><code>${match}</code></div>`;
            }
        });
    }

    /**
     * 预处理数学公式（防止被Markdown解析器误处理）
     * @param {string} content - 内容
     * @returns {Object} {content: string, mathBlocks: Array}
     */
    preprocessMath(content) {
        const mathBlocks = [];
        let processed = content;

        // 提取并替换块级公式
        processed = processed.replace(this.blockMathRegex, (match, math) => {
            const placeholder = `MATH_BLOCK_${mathBlocks.length}`;
            mathBlocks.push({
                type: 'block',
                content: math,
                placeholder: placeholder
            });
            return placeholder;
        });

        // 提取并替换行内公式
        processed = processed.replace(this.inlineMathRegex, (match, math) => {
            const placeholder = `MATH_INLINE_${mathBlocks.length}`;
            mathBlocks.push({
                type: 'inline',
                content: math,
                placeholder: placeholder
            });
            return placeholder;
        });

        // 提取LaTeX环境
        processed = processed.replace(this.latexBlockRegex, (match, env, body) => {
            const placeholder = `MATH_ENV_${mathBlocks.length}`;
            mathBlocks.push({
                type: 'environment',
                env: env,
                content: body,
                placeholder: placeholder
            });
            return placeholder;
        });

        return { content: processed, mathBlocks: mathBlocks };
    }

    /**
     * 恢复数学公式（在Markdown处理后）
     * @param {string} content - 处理后的内容
     * @param {Array} mathBlocks - 数学公式块
     * @returns {string} 恢复后的内容
     */
    restoreMath(content, mathBlocks) {
        let restored = content;

        mathBlocks.forEach(block => {
            let rendered;

            try {
                if (block.type === 'block') {
                    rendered = katex.renderToString(block.content.trim(), {
                        ...this.katexOptions,
                        displayMode: true
                    });
                    rendered = `<div class="math-block" style="text-align: center; margin: 1em 0; overflow-x: auto;">${rendered}</div>`;
                } else if (block.type === 'inline') {
                    rendered = katex.renderToString(block.content.trim(), {
                        ...this.katexOptions,
                        displayMode: false
                    });
                    rendered = `<span class="math-inline" style="display: inline-block; vertical-align: middle;">${rendered}</span>`;
                } else if (block.type === 'environment') {
                    const fullLatex = `\\begin{${block.env}}${block.content}\\end{${block.env}}`;
                    rendered = katex.renderToString(fullLatex, {
                        ...this.katexOptions,
                        displayMode: true
                    });
                    rendered = `<div class="math-environment" style="text-align: center; margin: 1.5em 0; overflow-x: auto;">${rendered}</div>`;
                }

                restored = restored.replace(block.placeholder, rendered);
            } catch (error) {
                console.error(`数学公式渲染失败 (${block.type}):`, error);
                const errorHtml = `<span class="math-error" style="color: #cc0000; background: #fff2f2; padding: 0.1em 0.3em; border-radius: 2px;"><strong>公式错误:</strong> ${block.content}</span>`;
                restored = restored.replace(block.placeholder, errorHtml);
            }
        });

        return restored;
    }

    /**
     * 获取数学公式统计信息
     * @param {string} content - 内容
     * @returns {Object} 统计信息
     */
    getMathStats(content) {
        const blockMatches = content.match(this.blockMathRegex) || [];
        const inlineMatches = content.match(this.inlineMathRegex) || [];
        const envMatches = content.match(this.latexBlockRegex) || [];

        return {
            blockMath: blockMatches.length,
            inlineMath: inlineMatches.length,
            environments: envMatches.length,
            total: blockMatches.length + inlineMatches.length + envMatches.length,
            hasKatex: this.isKatexAvailable()
        };
    }

    /**
     * 验证数学公式语法
     * @param {string} math - 数学公式
     * @param {boolean} displayMode - 是否为显示模式
     * @returns {Object} 验证结果
     */
    validateMath(math, displayMode = false) {
        if (!this.isKatexAvailable()) {
            return {
                isValid: false,
                error: 'KaTeX未加载'
            };
        }

        try {
            katex.renderToString(math, {
                ...this.katexOptions,
                displayMode: displayMode,
                throwOnError: true
            });

            return {
                isValid: true,
                error: null
            };
        } catch (error) {
            return {
                isValid: false,
                error: error.message
            };
        }
    }

    /**
     * 为微信适配数学公式样式
     * @param {string} renderedMath - 已渲染的数学公式HTML
     * @returns {string} 适配后的HTML
     */
    adaptForWeChat(renderedMath) {
        // 移除KaTeX的一些可能被微信过滤的样式类
        let adapted = renderedMath;

        // 将样式内联化
        adapted = adapted.replace(/class="([^"]+)"/g, (match, classes) => {
            // 这里可以根据需要将特定的class转换为内联样式
            // 目前保留class，因为我们的CSS已经处理了KaTeX样式
            return match;
        });

        // 确保数学公式在微信中正确显示
        adapted = adapted.replace(/<span class="katex">/g, '<span class="katex" style="display: inline-block;">');
        adapted = adapted.replace(/<span class="katex-display">/g, '<span class="katex-display" style="display: block; text-align: center; margin: 1em 0;">');

        return adapted;
    }
}