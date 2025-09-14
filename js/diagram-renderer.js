// 图表渲染器（Mermaid）

class DiagramRenderer {
    constructor() {
        this.mermaidInitialized = false;
        this.diagramCounter = 0;

        // Mermaid配置
        this.mermaidConfig = {
            startOnLoad: false,
            theme: 'default',
            themeVariables: {
                primaryColor: '#3498db',
                primaryTextColor: '#333',
                primaryBorderColor: '#2980b9',
                lineColor: '#7f8c8d',
                sectionBkgColor: '#ecf0f1',
                altSectionBkgColor: '#bdc3c7',
                gridColor: '#95a5a6',
                textColor: '#2c3e50',
                taskBkgColor: '#3498db',
                taskTextColor: '#fff',
                taskTextLightColor: '#333',
                taskTextOutsideColor: '#333',
                taskTextClickableColor: '#003163',
                activeTaskBkgColor: '#2980b9',
                activeTaskBorderColor: '#1f618d',
                gridColor: '#ddd',
                section0: '#e8f4f8',
                section1: '#f2f2f2',
                section2: '#d5e8d4',
                section3: '#fff2cc'
            },
            flowchart: {
                htmlLabels: true,
                curve: 'basis',
                useMaxWidth: true,
                nodeSpacing: 50,
                rankSpacing: 50
            },
            sequence: {
                diagramMarginX: 50,
                diagramMarginY: 10,
                actorMargin: 50,
                width: 150,
                height: 65,
                boxMargin: 10,
                boxTextMargin: 5,
                noteMargin: 10,
                messageMargin: 35,
                mirrorActors: true,
                bottomMarginAdj: 1,
                useMaxWidth: true
            },
            gantt: {
                numberSectionStyles: 4,
                axisFormat: '%Y-%m-%d',
                useMaxWidth: true
            }
        };

        // 图表类型正则表达式
        this.mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
        this.diagramTypes = {
            flowchart: /^(graph|flowchart)\s+(TD|TB|BT|RL|LR)/i,
            sequence: /^sequenceDiagram/i,
            gantt: /^gantt/i,
            pie: /^pie(\s+title\s+.+)?/i,
            gitgraph: /^gitGraph/i,
            erDiagram: /^erDiagram/i,
            journey: /^journey/i,
            requirement: /^requirementDiagram/i,
            stateDiagram: /^stateDiagram(-v2)?/i,
            classDiagram: /^classDiagram/i
        };
    }

    /**
     * 检查Mermaid是否可用
     * @returns {boolean} Mermaid是否可用
     */
    isMermaidAvailable() {
        return typeof mermaid !== 'undefined';
    }

    /**
     * 初始化Mermaid
     * @returns {Promise<boolean>} 初始化是否成功
     */
    async initMermaid() {
        if (!this.isMermaidAvailable()) {
            console.warn('Mermaid未加载，跳过图表渲染');
            return false;
        }

        if (this.mermaidInitialized) {
            return true;
        }

        try {
            mermaid.initialize(this.mermaidConfig);
            this.mermaidInitialized = true;
            return true;
        } catch (error) {
            console.error('Mermaid初始化失败:', error);
            return false;
        }
    }

    /**
     * 渲染Mermaid图表
     * @param {string} content - 包含Mermaid图表的内容
     * @returns {Promise<string>} 渲染后的内容
     */
    async renderDiagrams(content) {
        if (!this.isMermaidAvailable()) {
            console.warn('Mermaid未加载，跳过图表渲染');
            return this.renderFallbackDiagrams(content);
        }

        await this.initMermaid();

        try {
            // 提取并渲染所有Mermaid图表
            const matches = [...content.matchAll(this.mermaidRegex)];
            let processed = content;

            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                const diagramCode = match[1].trim();
                const diagramId = `mermaid-diagram-${this.diagramCounter++}`;

                try {
                    // 验证语法
                    const isValid = await this.validateDiagramSyntax(diagramCode);
                    if (!isValid) {
                        throw new Error('图表语法无效');
                    }

                    // 渲染图表
                    const svgCode = await mermaid.render(diagramId, diagramCode);

                    // 创建包装器
                    const wrapper = this.createDiagramWrapper(svgCode.svg, diagramCode);

                    // 替换原始代码块
                    processed = processed.replace(match[0], wrapper);

                } catch (error) {
                    console.error('图表渲染失败:', error);

                    // 创建错误显示
                    const errorWrapper = this.createErrorDiagram(diagramCode, error.message);
                    processed = processed.replace(match[0], errorWrapper);
                }
            }

            return processed;

        } catch (error) {
            console.error('图表处理失败:', error);
            return this.renderFallbackDiagrams(content);
        }
    }

    /**
     * 验证图表语法
     * @param {string} diagramCode - 图表代码
     * @returns {Promise<boolean>} 语法是否有效
     */
    async validateDiagramSyntax(diagramCode) {
        try {
            // 检查图表类型
            const diagramType = this.detectDiagramType(diagramCode);
            if (!diagramType) {
                return false;
            }

            // 基本语法检查
            const lines = diagramCode.split('\n');
            const hasValidStart = lines.some(line =>
                Object.values(this.diagramTypes).some(regex => regex.test(line.trim()))
            );

            return hasValidStart;
        } catch (error) {
            return false;
        }
    }

    /**
     * 检测图表类型
     * @param {string} diagramCode - 图表代码
     * @returns {string|null} 图表类型
     */
    detectDiagramType(diagramCode) {
        const firstLine = diagramCode.split('\n')[0].trim();

        for (const [type, regex] of Object.entries(this.diagramTypes)) {
            if (regex.test(firstLine)) {
                return type;
            }
        }

        return null;
    }

    /**
     * 创建图表包装器
     * @param {string} svgCode - SVG代码
     * @param {string} originalCode - 原始代码
     * @returns {string} 包装后的HTML
     */
    createDiagramWrapper(svgCode, originalCode) {
        const diagramType = this.detectDiagramType(originalCode) || 'unknown';

        // 清理SVG代码，移除可能的安全问题
        const cleanSvg = this.sanitizeSVG(svgCode);

        return `
            <div class="mermaid-diagram" data-type="${diagramType}" style="text-align: center; margin: 1.5em 0; overflow-x: auto; background-color: #fff; border: 1px solid #e1e8ed; border-radius: 6px; padding: 1em;">
                ${cleanSvg}
            </div>
        `;
    }

    /**
     * 创建错误图表显示
     * @param {string} originalCode - 原始代码
     * @param {string} errorMessage - 错误信息
     * @returns {string} 错误显示HTML
     */
    createErrorDiagram(originalCode, errorMessage) {
        return `
            <div class="mermaid-error" style="background-color: #fff5f5; border: 1px solid #feb2b2; border-radius: 4px; padding: 1em; margin: 1.5em 0; color: #c53030;">
                <div style="font-weight: bold; margin-bottom: 0.5em;">
                    ⚠️ 图表渲染失败
                </div>
                <div style="margin-bottom: 0.5em; font-size: 0.9em;">
                    错误信息: ${errorMessage}
                </div>
                <details style="margin-top: 0.5em;">
                    <summary style="cursor: pointer; font-size: 0.9em;">查看原始代码</summary>
                    <pre style="background-color: #f7fafc; padding: 0.5em; border-radius: 3px; margin-top: 0.5em; font-size: 0.8em; overflow-x: auto;"><code>${this.escapeHtml(originalCode)}</code></pre>
                </details>
            </div>
        `;
    }

    /**
     * 渲染备用图表（当Mermaid不可用时）
     * @param {string} content - 内容
     * @returns {string} 处理后的内容
     */
    renderFallbackDiagrams(content) {
        return content.replace(this.mermaidRegex, (match, diagramCode) => {
            return `
                <div class="mermaid-fallback" style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1em; margin: 1.5em 0;">
                    <div style="font-weight: bold; margin-bottom: 0.5em; color: #495057;">
                        📊 Mermaid 图表
                    </div>
                    <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 0.5em;">
                        图表库未加载，显示原始代码：
                    </div>
                    <pre style="background-color: #ffffff; padding: 0.8em; border: 1px solid #e9ecef; border-radius: 3px; overflow-x: auto; font-family: 'Monaco', 'Consolas', monospace; font-size: 0.85em;"><code>${this.escapeHtml(diagramCode)}</code></pre>
                </div>
            `;
        });
    }

    /**
     * 清理SVG代码
     * @param {string} svgCode - SVG代码
     * @returns {string} 清理后的SVG代码
     */
    sanitizeSVG(svgCode) {
        // 移除潜在的安全风险元素和属性
        let cleaned = svgCode;

        // 移除script标签
        cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');

        // 移除事件处理属性
        cleaned = cleaned.replace(/\s*on\w+\s*=\s*"[^"]*"/gi, '');
        cleaned = cleaned.replace(/\s*on\w+\s*=\s*'[^']*'/gi, '');

        // 移除javascript:链接
        cleaned = cleaned.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');

        return cleaned;
    }

    /**
     * 预处理Mermaid图表（防止被Markdown解析器误处理）
     * @param {string} content - 内容
     * @returns {Object} {content: string, diagramBlocks: Array}
     */
    preprocessDiagrams(content) {
        const diagramBlocks = [];
        let processed = content;

        // 提取并替换Mermaid代码块
        processed = processed.replace(this.mermaidRegex, (match, diagramCode) => {
            const placeholder = `__MERMAID_DIAGRAM_${diagramBlocks.length}__`;
            diagramBlocks.push({
                code: diagramCode,
                placeholder: placeholder,
                type: this.detectDiagramType(diagramCode) || 'unknown'
            });
            return placeholder;
        });

        return { content: processed, diagramBlocks: diagramBlocks };
    }

    /**
     * 恢复图表（在Markdown处理后）
     * @param {string} content - 处理后的内容
     * @param {Array} diagramBlocks - 图表块
     * @returns {Promise<string>} 恢复后的内容
     */
    async restoreDiagrams(content, diagramBlocks) {
        if (!diagramBlocks.length) {
            return content;
        }

        await this.initMermaid();
        let restored = content;

        for (const block of diagramBlocks) {
            try {
                const diagramId = `mermaid-diagram-${this.diagramCounter++}`;

                if (this.isMermaidAvailable()) {
                    const svgCode = await mermaid.render(diagramId, block.code);
                    const wrapper = this.createDiagramWrapper(svgCode.svg, block.code);
                    restored = restored.replace(block.placeholder, wrapper);
                } else {
                    const fallback = this.createFallbackDiagram(block.code);
                    restored = restored.replace(block.placeholder, fallback);
                }
            } catch (error) {
                console.error('图表恢复失败:', error);
                const errorWrapper = this.createErrorDiagram(block.code, error.message);
                restored = restored.replace(block.placeholder, errorWrapper);
            }
        }

        return restored;
    }

    /**
     * 创建备用图表显示
     * @param {string} diagramCode - 图表代码
     * @returns {string} 备用显示HTML
     */
    createFallbackDiagram(diagramCode) {
        return `
            <div class="mermaid-fallback" style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 1em; margin: 1.5em 0;">
                <div style="font-weight: bold; margin-bottom: 0.5em; color: #495057;">
                    📊 Mermaid 图表
                </div>
                <pre style="background-color: #ffffff; padding: 0.8em; border: 1px solid #e9ecef; border-radius: 3px; overflow-x: auto; font-family: 'Monaco', 'Consolas', monospace; font-size: 0.85em;"><code>${this.escapeHtml(diagramCode)}</code></pre>
            </div>
        `;
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
     * 获取图表统计信息
     * @param {string} content - 内容
     * @returns {Object} 统计信息
     */
    getDiagramStats(content) {
        const matches = content.match(this.mermaidRegex) || [];
        const types = {};

        matches.forEach(match => {
            const diagramCode = match.replace(/```mermaid\n([\s\S]*?)\n```/, '$1');
            const type = this.detectDiagramType(diagramCode) || 'unknown';
            types[type] = (types[type] || 0) + 1;
        });

        return {
            total: matches.length,
            types: types,
            hasMermaid: this.isMermaidAvailable()
        };
    }

    /**
     * 适配微信样式
     * @param {string} renderedDiagram - 已渲染的图表HTML
     * @returns {string} 适配后的HTML
     */
    adaptForWeChat(renderedDiagram) {
        // 将样式内联化，确保在微信中正确显示
        let adapted = renderedDiagram;

        // 添加微信兼容的样式
        adapted = adapted.replace(/<div class="mermaid-diagram"/g,
            '<div class="mermaid-diagram" style="display: block; text-align: center; margin: 1em 0; overflow-x: auto;"');

        // 确保SVG在微信中正确显示
        adapted = adapted.replace(/<svg/g, '<svg style="max-width: 100%; height: auto;"');

        return adapted;
    }
}