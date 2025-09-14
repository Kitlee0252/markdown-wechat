// 微信适配模块

class WeChatAdapter {
    constructor() {
        this.inlineStyles = true;
        this.removeUnsafeAttributes = true;

        // 关键样式白名单 - 这些样式对微信显示很重要
        this.criticalStyles = [
            'color', 'background-color', 'background', 'font-size', 'font-weight',
            'font-family', 'line-height', 'text-align', 'text-decoration',
            'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
            'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
            'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
            'border-color', 'border-width', 'border-style', 'border-radius',
            'width', 'max-width', 'height', 'min-height', 'max-height',
            'display', 'position', 'float', 'clear', 'overflow',
            'text-indent', 'letter-spacing', 'word-spacing'
        ];

        // 微信支持的安全标签白名单
        this.wechatSafeTags = [
            'p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'u',
            'table', 'thead', 'tbody', 'tr', 'td', 'th',
            'blockquote', 'img', 'a', 'br', 'hr', 'pre', 'code'
        ];

        // 安全属性白名单
        this.safeAttributes = [
            'style', 'class', 'id', 'src', 'href', 'alt', 'title',
            'width', 'height', 'colspan', 'rowspan'
        ];
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

            // 过滤不支持的HTML标签
            this.filterUnsupportedTags(tempDiv);

            // 处理伪元素
            this.processPseudoElements(tempDiv);

            // 简化复杂选择器
            this.simplifyComplexSelectors(tempDiv);

            // 过滤不安全的属性
            this.filterUnsafeAttributes(tempDiv);

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
     * 内联所有样式（增强版）
     * @param {Element} container - 容器元素
     */
    inlineAllStyles(container) {
        const elements = container.querySelectorAll('*');

        elements.forEach(el => {
            // 获取计算样式
            const computedStyle = window.getComputedStyle(el);

            // 提取关键样式并内联化
            const inlineStyles = this.extractCriticalStyles(computedStyle, el);

            // 合并现有内联样式
            if (el.style.cssText) {
                const existingStyles = this.parseStyleString(el.style.cssText);
                Object.assign(inlineStyles, existingStyles);
            }

            // 处理CSS简写属性
            this.expandShorthandProperties(inlineStyles);

            // 应用样式到元素
            this.applyInlineStyles(el, inlineStyles);
        });
    }

    /**
     * 从计算样式中提取关键样式
     * @param {CSSStyleDeclaration} computedStyle - 计算样式
     * @param {Element} element - 元素
     * @returns {Object} 关键样式对象
     */
    extractCriticalStyles(computedStyle, element) {
        const styles = {};

        this.criticalStyles.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value && this.isValidStyleValue(prop, value)) {
                // 处理颜色值标准化
                if (prop.includes('color')) {
                    styles[prop] = this.normalizeColor(value);
                } else {
                    styles[prop] = value;
                }
            }
        });

        return styles;
    }

    /**
     * 解析样式字符串为对象
     * @param {string} styleString - 样式字符串
     * @returns {Object} 样式对象
     */
    parseStyleString(styleString) {
        const styles = {};
        const declarations = styleString.split(';');

        declarations.forEach(decl => {
            const [prop, value] = decl.split(':').map(s => s.trim());
            if (prop && value) {
                styles[prop] = value.replace(' !important', '');
            }
        });

        return styles;
    }

    /**
     * 展开CSS简写属性
     * @param {Object} styles - 样式对象
     */
    expandShorthandProperties(styles) {
        // 处理margin简写
        if (styles.margin && !styles['margin-top']) {
            const margins = this.parseShorthand(styles.margin);
            if (margins.length === 1) {
                styles['margin-top'] = styles['margin-right'] =
                styles['margin-bottom'] = styles['margin-left'] = margins[0];
            } else if (margins.length === 2) {
                styles['margin-top'] = styles['margin-bottom'] = margins[0];
                styles['margin-right'] = styles['margin-left'] = margins[1];
            } else if (margins.length === 4) {
                styles['margin-top'] = margins[0];
                styles['margin-right'] = margins[1];
                styles['margin-bottom'] = margins[2];
                styles['margin-left'] = margins[3];
            }
            delete styles.margin;
        }

        // 处理padding简写
        if (styles.padding && !styles['padding-top']) {
            const paddings = this.parseShorthand(styles.padding);
            if (paddings.length === 1) {
                styles['padding-top'] = styles['padding-right'] =
                styles['padding-bottom'] = styles['padding-left'] = paddings[0];
            } else if (paddings.length === 2) {
                styles['padding-top'] = styles['padding-bottom'] = paddings[0];
                styles['padding-right'] = styles['padding-left'] = paddings[1];
            } else if (paddings.length === 4) {
                styles['padding-top'] = paddings[0];
                styles['padding-right'] = paddings[1];
                styles['padding-bottom'] = paddings[2];
                styles['padding-left'] = paddings[3];
            }
            delete styles.padding;
        }

        // 处理border简写
        if (styles.border && !styles['border-width']) {
            const borderParts = styles.border.split(' ');
            if (borderParts.length >= 3) {
                styles['border-width'] = borderParts[0];
                styles['border-style'] = borderParts[1];
                styles['border-color'] = borderParts.slice(2).join(' ');
            }
            delete styles.border;
        }
    }

    /**
     * 解析简写属性值
     * @param {string} value - 属性值
     * @returns {Array} 解析后的值数组
     */
    parseShorthand(value) {
        return value.trim().split(/\s+/);
    }

    /**
     * 应用内联样式到元素
     * @param {Element} element - 元素
     * @param {Object} styles - 样式对象
     */
    applyInlineStyles(element, styles) {
        // 先应用CSS降级处理
        const processedStyles = this.applyCssFallbacks(styles);
        const styleArray = [];

        Object.keys(processedStyles).forEach(prop => {
            const value = processedStyles[prop];
            if (value && value !== 'initial' && value !== 'inherit') {
                // 智能添加!important标记
                const important = this.needsImportant(prop, element) ? ' !important' : '';
                styleArray.push(`${prop}: ${value}${important}`);
            }
        });

        element.style.cssText = styleArray.join('; ');
    }

    /**
     * 判断样式值是否有效
     * @param {string} prop - 样式属性
     * @param {string} value - 样式值
     * @returns {boolean} 是否有效
     */
    isValidStyleValue(prop, value) {
        // 过滤掉默认值和无效值
        const invalidValues = ['initial', 'inherit', 'unset', 'auto', 'none', '', '0px 0px 0px 0px'];
        return !invalidValues.includes(value) && value !== '0';
    }

    /**
     * 标准化颜色值
     * @param {string} color - 颜色值
     * @returns {string} 标准化的颜色值
     */
    normalizeColor(color) {
        // 将rgb转换为十六进制
        if (color.startsWith('rgb(')) {
            const match = color.match(/rgb\(([^)]+)\)/);
            if (match) {
                const [r, g, b] = match[1].split(',').map(n => parseInt(n.trim()));
                return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            }
        }
        return color;
    }

    /**
     * 判断是否需要添加!important
     * @param {string} prop - 样式属性
     * @param {Element} element - 元素
     * @returns {boolean} 是否需要
     */
    needsImportant(prop, element) {
        // 关键样式属性需要!important以确保在微信中生效
        const importantProps = [
            'color', 'background-color', 'font-size', 'font-weight',
            'text-align', 'line-height', 'margin', 'padding',
            'border', 'width', 'max-width', 'display'
        ];

        return importantProps.some(p => prop.startsWith(p));
    }

    /**
     * 过滤不支持的HTML标签
     * @param {Element} container - 容器元素
     */
    filterUnsupportedTags(container) {
        const allElements = container.querySelectorAll('*');
        const elementsArray = Array.from(allElements);

        elementsArray.forEach(el => {
            const tagName = el.tagName.toLowerCase();

            if (!this.wechatSafeTags.includes(tagName)) {
                // 不支持的标签转换为安全的替代标签
                const replacement = this.getTagReplacement(tagName, el);
                this.replaceElement(el, replacement);
            }
        });
    }

    /**
     * 获取标签替换方案
     * @param {string} tagName - 原标签名
     * @param {Element} element - 原元素
     * @returns {string} 替换标签名
     */
    getTagReplacement(tagName, element) {
        const tagReplacements = {
            // 块级元素替换
            'section': 'div',
            'article': 'div',
            'aside': 'div',
            'nav': 'div',
            'header': 'div',
            'footer': 'div',
            'main': 'div',
            'figure': 'div',
            'figcaption': 'div',

            // 内联元素替换
            'mark': 'span',
            'small': 'span',
            'sub': 'span',
            'sup': 'span',
            'time': 'span',
            'abbr': 'span',
            'cite': 'span',
            'dfn': 'span',
            'kbd': 'span',
            'samp': 'span',
            'var': 'span',

            // 危险元素移除内容
            'script': null,
            'style': null,
            'iframe': null,
            'object': null,
            'embed': null,
            'form': null,
            'input': null,
            'button': null,
            'select': null,
            'textarea': null,

            // 列表相关
            'dl': 'ul',
            'dt': 'li',
            'dd': 'li'
        };

        return tagReplacements[tagName] || 'div';
    }

    /**
     * 替换元素标签
     * @param {Element} oldElement - 原元素
     * @param {string} newTagName - 新标签名
     */
    replaceElement(oldElement, newTagName) {
        if (!newTagName) {
            // 如果没有替换标签，直接移除元素
            oldElement.remove();
            return;
        }

        const newElement = document.createElement(newTagName);

        // 复制内容
        newElement.innerHTML = oldElement.innerHTML;

        // 复制安全属性
        Array.from(oldElement.attributes).forEach(attr => {
            if (this.safeAttributes.includes(attr.name.toLowerCase())) {
                newElement.setAttribute(attr.name, attr.value);
            }
        });

        // 替换元素
        oldElement.parentNode.replaceChild(newElement, oldElement);
    }

    /**
     * 过滤不安全的属性
     * @param {Element} container - 容器元素
     */
    filterUnsafeAttributes(container) {
        const elements = container.querySelectorAll('*');

        elements.forEach(el => {
            const attributesToRemove = [];

            // 收集需要移除的属性
            Array.from(el.attributes).forEach(attr => {
                const attrName = attr.name.toLowerCase();

                if (!this.safeAttributes.includes(attrName)) {
                    // 特殊处理一些属性
                    if (attrName.startsWith('on')) {
                        // 移除所有事件处理属性
                        attributesToRemove.push(attr.name);
                    } else if (attrName.startsWith('data-') && !this.isDataAttributeSafe(attr.value)) {
                        // 移除可能不安全的data属性
                        attributesToRemove.push(attr.name);
                    } else if (!this.safeAttributes.includes(attrName)) {
                        // 移除不在白名单中的属性
                        attributesToRemove.push(attr.name);
                    }
                }
            });

            // 移除不安全的属性
            attributesToRemove.forEach(attrName => {
                el.removeAttribute(attrName);
            });
        });
    }

    /**
     * 检查data属性是否安全
     * @param {string} value - 属性值
     * @returns {boolean} 是否安全
     */
    isDataAttributeSafe(value) {
        // 检查是否包含危险的JavaScript代码
        const dangerousPatterns = [
            /javascript:/i,
            /on\w+=/i,
            /<script/i,
            /eval\(/i,
            /function\(/i
        ];

        return !dangerousPatterns.some(pattern => pattern.test(value));
    }

    /**
     * CSS降级处理
     * @param {Object} styles - 样式对象
     * @returns {Object} 处理后的样式
     */
    applyCssFallbacks(styles) {
        const processedStyles = { ...styles };

        // 处理Flexbox降级
        if (processedStyles.display === 'flex') {
            processedStyles.display = 'block';
            processedStyles['text-align'] = 'left';
        }

        // 处理Grid降级
        if (processedStyles.display === 'grid') {
            processedStyles.display = 'block';
        }

        // 处理不支持的单位
        Object.keys(processedStyles).forEach(prop => {
            const value = processedStyles[prop];
            if (typeof value === 'string') {
                // 将vw/vh转换为百分比
                if (value.includes('vw')) {
                    processedStyles[prop] = value.replace(/(\d+(\.\d+)?)vw/g, '$1%');
                }
                if (value.includes('vh')) {
                    // vh转换为固定值（估算）
                    processedStyles[prop] = value.replace(/(\d+(\.\d+)?)vh/g, (match, num) => {
                        return (parseFloat(num) * 6) + 'px'; // 粗略估算
                    });
                }

                // 将calc()转换为简单值
                if (value.includes('calc(')) {
                    processedStyles[prop] = this.simplifyCalc(value);
                }

                // 处理不支持的颜色格式
                if (prop.includes('color') && value.startsWith('hsl(')) {
                    processedStyles[prop] = this.hslToHex(value);
                }
            }
        });

        // 处理transform降级
        if (processedStyles.transform) {
            // 简单的transform操作保留，复杂的移除
            if (!this.isSimpleTransform(processedStyles.transform)) {
                delete processedStyles.transform;
            }
        }

        // 移除不支持的属性
        const unsupportedProps = [
            'backdrop-filter', 'filter', 'clip-path', 'mask',
            'animation', 'transition', 'transform-origin',
            'perspective', 'perspective-origin'
        ];

        unsupportedProps.forEach(prop => {
            if (processedStyles[prop]) {
                delete processedStyles[prop];
            }
        });

        return processedStyles;
    }

    /**
     * 简化calc()表达式
     * @param {string} value - 包含calc的CSS值
     * @returns {string} 简化后的值
     */
    simplifyCalc(value) {
        // 简单的calc表达式处理
        const calcMatch = value.match(/calc\(([^)]+)\)/);
        if (calcMatch) {
            const expression = calcMatch[1].trim();

            // 尝试计算简单的表达式
            try {
                // 只处理简单的数值计算
                if (/^[\d\s+\-*/.()]+$/.test(expression)) {
                    const result = eval(expression);
                    return result + 'px';
                }
            } catch (e) {
                // 计算失败，返回默认值
            }
        }

        return '100%'; // 默认值
    }

    /**
     * 将HSL颜色转换为十六进制
     * @param {string} hslValue - HSL颜色值
     * @returns {string} 十六进制颜色值
     */
    hslToHex(hslValue) {
        const match = hslValue.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (match) {
            const h = parseInt(match[1]) / 360;
            const s = parseInt(match[2]) / 100;
            const l = parseInt(match[3]) / 100;

            const rgb = this.hslToRgb(h, s, l);
            return `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`;
        }
        return hslValue;
    }

    /**
     * HSL转RGB
     * @param {number} h - 色调
     * @param {number} s - 饱和度
     * @param {number} l - 亮度
     * @returns {Array} RGB数组
     */
    hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    /**
     * 检查是否为简单的transform
     * @param {string} transformValue - transform值
     * @returns {boolean} 是否简单
     */
    isSimpleTransform(transformValue) {
        // 只允许简单的缩放和旋转
        const simpleTransforms = /^(scale|rotate|translate)\([^)]+\)$/;
        return simpleTransforms.test(transformValue.trim());
    }

    /**
     * 处理伪元素，将::before和::after转换为实际元素
     * @param {Element} container - 容器元素
     */
    processPseudoElements(container) {
        // 获取所有样式表
        const styleSheets = Array.from(document.styleSheets);
        const pseudoRules = this.extractPseudoElementRules(styleSheets);

        // 处理容器中的所有元素
        const elements = container.querySelectorAll('*');
        elements.forEach(el => {
            this.processPseudoElementsForElement(el, pseudoRules);
        });
    }

    /**
     * 提取伪元素规则
     * @param {Array} styleSheets - 样式表数组
     * @returns {Object} 伪元素规则对象
     */
    extractPseudoElementRules(styleSheets) {
        const pseudoRules = {};

        styleSheets.forEach(sheet => {
            try {
                const rules = sheet.cssRules || sheet.rules;
                if (!rules) return;

                Array.from(rules).forEach(rule => {
                    if (rule.type === CSSRule.STYLE_RULE) {
                        const selector = rule.selectorText;
                        if (selector && (selector.includes('::before') || selector.includes('::after'))) {
                            const pseudoType = selector.includes('::before') ? 'before' : 'after';
                            const baseSelector = selector.replace(/::(before|after)/, '').trim();

                            if (!pseudoRules[baseSelector]) {
                                pseudoRules[baseSelector] = {};
                            }

                            pseudoRules[baseSelector][pseudoType] = {
                                content: rule.style.content,
                                styles: this.extractStylesFromRule(rule.style)
                            };
                        }
                    }
                });
            } catch (e) {
                // 忽略跨域样式表错误
            }
        });

        return pseudoRules;
    }

    /**
     * 从 CSS 规则中提取样式
     * @param {CSSStyleDeclaration} style - 样式声明
     * @returns {Object} 样式对象
     */
    extractStylesFromRule(style) {
        const styles = {};
        for (let i = 0; i < style.length; i++) {
            const prop = style[i];
            if (prop !== 'content') {
                styles[prop] = style.getPropertyValue(prop);
            }
        }
        return styles;
    }

    /**
     * 为单个元素处理伪元素
     * @param {Element} element - 目标元素
     * @param {Object} pseudoRules - 伪元素规则
     */
    processPseudoElementsForElement(element, pseudoRules) {
        Object.keys(pseudoRules).forEach(selector => {
            try {
                if (element.matches(selector)) {
                    const rules = pseudoRules[selector];

                    // 处理::before
                    if (rules.before) {
                        this.createPseudoElement(element, 'before', rules.before);
                    }

                    // 处理::after
                    if (rules.after) {
                        this.createPseudoElement(element, 'after', rules.after);
                    }
                }
            } catch (e) {
                // 忽略无效的选择器
            }
        });
    }

    /**
     * 创建伪元素对应的实际元素
     * @param {Element} parentElement - 父元素
     * @param {string} type - 伪元素类型（before/after）
     * @param {Object} rule - 伪元素规则
     */
    createPseudoElement(parentElement, type, rule) {
        const pseudoElement = document.createElement('span');
        pseudoElement.className = `pseudo-${type}`;

        // 设置内容
        if (rule.content) {
            let content = rule.content.replace(/["']/g, '');
            // 处理特殊内容
            if (content === 'counter(section)') content = '•'; // 默认项目符号
            if (content === 'counter(subsection, upper-roman)') content = 'I.';
            pseudoElement.textContent = content;
        }

        // 应用样式
        if (rule.styles) {
            const processedStyles = this.applyCssFallbacks(rule.styles);
            Object.keys(processedStyles).forEach(prop => {
                const value = processedStyles[prop];
                if (value) {
                    pseudoElement.style.setProperty(prop, value, 'important');
                }
            });
        }

        // 插入到适当的位置
        if (type === 'before') {
            parentElement.insertBefore(pseudoElement, parentElement.firstChild);
        } else {
            parentElement.appendChild(pseudoElement);
        }
    }

    /**
     * 简化复杂选择器，优先使用类选择器和标签选择器
     * @param {Element} container - 容器元素
     */
    simplifyComplexSelectors(container) {
        // 获取所有元素
        const elements = container.querySelectorAll('*');

        elements.forEach(el => {
            // 为元素添加类名以简化选择
            if (!el.className) {
                const tagName = el.tagName.toLowerCase();
                if (this.wechatSafeTags.includes(tagName)) {
                    el.className = `wechat-${tagName}`;
                }
            }

            // 处理特殊情况
            if (el.tagName.toLowerCase() === 'blockquote' && !el.className.includes('quote')) {
                el.className += ' wechat-quote';
            }

            if (el.tagName.toLowerCase() === 'pre' && !el.className.includes('code')) {
                el.className += ' wechat-code-block';
            }

            if (el.tagName.toLowerCase() === 'code' && el.parentNode.tagName.toLowerCase() !== 'pre') {
                el.className += ' wechat-inline-code';
            }
        });
    }

    /**
     * 移除不安全的属性（保留原方法以向后兼容）
     * @param {Element} container - 容器元素
     */
    removeUnsafeAttrs(container) {
        this.filterUnsafeAttributes(container);
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