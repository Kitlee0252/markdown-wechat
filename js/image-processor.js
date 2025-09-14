// 图片处理器

class ImageProcessor {
    constructor() {
        this.imageCounter = 0;
        this.processedImages = new Map();

        // 配置选项
        this.config = {
            maxFileSize: 500 * 1024, // 500KB - 小于此大小自动转base64
            maxWidth: 800, // 最大宽度
            maxHeight: 600, // 最大高度
            quality: 0.8, // JPEG压缩质量
            supportedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
            wechatSafeTypes: ['image/jpeg', 'image/png', 'image/gif'], // 微信安全的图片类型
        };

        this.supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    }

    /**
     * 处理图片（拖拽或粘贴）
     * @param {File|Blob} file - 图片文件
     * @param {Object} options - 处理选项
     * @returns {Promise<Object>} 处理结果
     */
    async processImage(file, options = {}) {
        const opts = { ...this.config, ...options };

        try {
            // 验证文件类型
            if (!this.isValidImageType(file.type)) {
                throw new Error(`不支持的图片类型: ${file.type}`);
            }

            // 检查文件大小
            if (file.size > 10 * 1024 * 1024) { // 10MB限制
                throw new Error('图片文件过大，请选择小于10MB的图片');
            }

            // 生成图片ID
            const imageId = `img-${this.imageCounter++}-${Date.now()}`;

            // 读取文件
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            const originalSize = file.size;

            let processedData;
            let processingInfo = {
                originalSize: originalSize,
                originalType: file.type,
                fileName: file.name || `image-${imageId}`,
            };

            // 根据大小决定处理策略
            if (originalSize <= opts.maxFileSize) {
                // 小文件直接转base64
                processedData = await this.convertToBase64(file, opts);
                processingInfo.strategy = 'base64';
                processingInfo.base64 = processedData.data;
                processingInfo.finalSize = Math.ceil(processedData.data.length * 0.75); // base64大约增加33%
            } else {
                // 大文件进行压缩处理
                processedData = await this.compressImage(file, opts);
                processingInfo.strategy = 'compressed';
                processingInfo.compressedSize = processedData.size;
                processingInfo.compressionRatio = (processedData.size / originalSize).toFixed(2);

                // 如果压缩后仍然较小，转base64
                if (processedData.size <= opts.maxFileSize) {
                    const base64Data = await this.convertToBase64(processedData.file, opts);
                    processingInfo.base64 = base64Data.data;
                    processingInfo.strategy = 'compressed-base64';
                }
            }

            // 存储处理结果
            const result = {
                id: imageId,
                ...processingInfo,
                dimensions: processedData.dimensions || null,
                timestamp: Date.now()
            };

            this.processedImages.set(imageId, result);

            return result;

        } catch (error) {
            console.error('图片处理失败:', error);
            throw error;
        }
    }

    /**
     * 读取文件为ArrayBuffer
     * @param {File|Blob} file - 文件
     * @returns {Promise<ArrayBuffer>} ArrayBuffer
     */
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * 转换为Base64
     * @param {File|Blob} file - 文件
     * @param {Object} options - 选项
     * @returns {Promise<Object>} Base64数据
     */
    convertToBase64(file, options = {}) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result;
                resolve({
                    data: result,
                    mimeType: file.type,
                    size: Math.ceil(result.length * 0.75)
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * 压缩图片
     * @param {File|Blob} file - 原始文件
     * @param {Object} options - 压缩选项
     * @returns {Promise<Object>} 压缩结果
     */
    async compressImage(file, options = {}) {
        const opts = { ...this.config, ...options };

        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                try {
                    // 计算新尺寸
                    const { width, height } = this.calculateDimensions(
                        img.width,
                        img.height,
                        opts.maxWidth,
                        opts.maxHeight
                    );

                    // 设置canvas尺寸
                    canvas.width = width;
                    canvas.height = height;

                    // 绘制压缩图片
                    ctx.drawImage(img, 0, 0, width, height);

                    // 转换为Blob
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            reject(new Error('图片压缩失败'));
                            return;
                        }

                        resolve({
                            file: blob,
                            size: blob.size,
                            dimensions: { width, height },
                            originalDimensions: { width: img.width, height: img.height }
                        });
                    }, this.getOutputMimeType(file.type), opts.quality);

                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => reject(new Error('图片加载失败'));

            // 创建图片URL
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * 计算缩放后的尺寸
     * @param {number} originalWidth - 原始宽度
     * @param {number} originalHeight - 原始高度
     * @param {number} maxWidth - 最大宽度
     * @param {number} maxHeight - 最大高度
     * @returns {Object} 新尺寸
     */
    calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
        let width = originalWidth;
        let height = originalHeight;

        // 按比例缩放
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }

        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }

        return {
            width: Math.round(width),
            height: Math.round(height)
        };
    }

    /**
     * 获取输出MIME类型
     * @param {string} inputType - 输入类型
     * @returns {string} 输出类型
     */
    getOutputMimeType(inputType) {
        // 对于微信兼容性，统一输出为JPEG或PNG
        if (inputType === 'image/png' || inputType === 'image/gif') {
            return 'image/png';
        }
        return 'image/jpeg';
    }

    /**
     * 验证图片类型
     * @param {string} mimeType - MIME类型
     * @returns {boolean} 是否有效
     */
    isValidImageType(mimeType) {
        return this.config.supportedTypes.includes(mimeType);
    }

    /**
     * 检查文件扩展名
     * @param {string} fileName - 文件名
     * @returns {boolean} 是否为图片文件
     */
    isImageFile(fileName) {
        if (!fileName) return false;

        const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
        return this.supportedExtensions.includes(ext);
    }

    /**
     * 处理剪贴板图片
     * @param {ClipboardEvent} event - 剪贴板事件
     * @returns {Promise<Array>} 处理结果数组
     */
    async processClipboardImages(event) {
        const items = Array.from(event.clipboardData.items);
        const imageItems = items.filter(item => item.type.indexOf('image') !== -1);

        if (imageItems.length === 0) {
            return [];
        }

        const results = [];
        for (const item of imageItems) {
            try {
                const file = item.getAsFile();
                if (file) {
                    const result = await this.processImage(file);
                    results.push(result);
                }
            } catch (error) {
                console.error('剪贴板图片处理失败:', error);
                results.push({
                    error: error.message,
                    type: item.type
                });
            }
        }

        return results;
    }

    /**
     * 处理拖拽图片
     * @param {DragEvent} event - 拖拽事件
     * @returns {Promise<Array>} 处理结果数组
     */
    async processDraggedImages(event) {
        const files = Array.from(event.dataTransfer.files);
        const imageFiles = files.filter(file => this.isValidImageType(file.type));

        if (imageFiles.length === 0) {
            return [];
        }

        const results = [];
        for (const file of imageFiles) {
            try {
                const result = await this.processImage(file);
                results.push(result);
            } catch (error) {
                console.error('拖拽图片处理失败:', error);
                results.push({
                    error: error.message,
                    fileName: file.name,
                    type: file.type
                });
            }
        }

        return results;
    }

    /**
     * 生成图片的Markdown代码
     * @param {Object} imageResult - 图片处理结果
     * @param {Object} options - 选项
     * @returns {string} Markdown代码
     */
    generateImageMarkdown(imageResult, options = {}) {
        const opts = {
            alt: options.alt || imageResult.fileName || 'image',
            title: options.title || '',
            ...options
        };

        if (imageResult.base64) {
            // 使用base64
            return `![${opts.alt}](${imageResult.base64}${opts.title ? ` "${opts.title}"` : ''})`;
        } else {
            // 使用占位符，提示用户上传到图床
            return `![${opts.alt}](请上传图片到图床并替换此链接${opts.title ? ` "${opts.title}"` : ''})`;
        }
    }

    /**
     * 生成HTML img标签
     * @param {Object} imageResult - 图片处理结果
     * @param {Object} options - 选项
     * @returns {string} HTML代码
     */
    generateImageHTML(imageResult, options = {}) {
        const opts = {
            alt: options.alt || imageResult.fileName || 'image',
            title: options.title || '',
            style: options.style || 'max-width: 100%; height: auto;',
            ...options
        };

        if (imageResult.base64) {
            return `<img src="${imageResult.base64}" alt="${opts.alt}"${opts.title ? ` title="${opts.title}"` : ''} style="${opts.style}">`;
        } else {
            return `<img src="请上传图片到图床并替换此链接" alt="${opts.alt}"${opts.title ? ` title="${opts.title}"` : ''} style="${opts.style}">`;
        }
    }

    /**
     * 获取处理过的图片信息
     * @param {string} imageId - 图片ID
     * @returns {Object|null} 图片信息
     */
    getImageInfo(imageId) {
        return this.processedImages.get(imageId) || null;
    }

    /**
     * 获取所有处理过的图片
     * @returns {Array} 图片数组
     */
    getAllImages() {
        return Array.from(this.processedImages.values());
    }

    /**
     * 清理图片缓存
     * @param {number} maxAge - 最大年龄（毫秒）
     */
    cleanupImages(maxAge = 60 * 60 * 1000) { // 默认1小时
        const now = Date.now();
        const expiredIds = [];

        this.processedImages.forEach((image, id) => {
            if (now - image.timestamp > maxAge) {
                expiredIds.push(id);
            }
        });

        expiredIds.forEach(id => {
            this.processedImages.delete(id);
        });

        return expiredIds.length;
    }

    /**
     * 获取图片处理统计
     * @returns {Object} 统计信息
     */
    getStats() {
        const images = this.getAllImages();
        const stats = {
            total: images.length,
            base64: 0,
            compressed: 0,
            totalOriginalSize: 0,
            totalProcessedSize: 0,
            strategies: {}
        };

        images.forEach(image => {
            stats.totalOriginalSize += image.originalSize || 0;
            stats.totalProcessedSize += image.finalSize || image.compressedSize || image.originalSize || 0;

            if (image.strategy) {
                stats.strategies[image.strategy] = (stats.strategies[image.strategy] || 0) + 1;
            }

            if (image.base64) {
                stats.base64++;
            }
            if (image.compressedSize) {
                stats.compressed++;
            }
        });

        if (stats.totalOriginalSize > 0) {
            stats.compressionRatio = (stats.totalProcessedSize / stats.totalOriginalSize).toFixed(2);
        }

        return stats;
    }

    /**
     * 导出图片资源（用于ZIP导出）
     * @returns {Array} 图片资源数组
     */
    exportImageResources() {
        return this.getAllImages().map(image => ({
            id: image.id,
            fileName: image.fileName,
            size: image.finalSize || image.compressedSize || image.originalSize,
            type: image.originalType,
            strategy: image.strategy,
            hasBase64: !!image.base64,
            dimensions: image.dimensions
        }));
    }
}