#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// 获取用户输入
const userPrompt = process.argv[2] || '';

// 检查是否匹配commit模式
const commitMatch = userPrompt.match(/^commit[:：]\s*(.+)$/i);

if (commitMatch) {
  const commitMessage = commitMatch[1].trim();

  if (!commitMessage) {
    console.log('❌ 请提供commit信息，格式：commit：[版本说明]');
    process.exit(1);
  }

  try {
    // 检查是否有未提交的更改
    const status = execSync('git status --porcelain', { encoding: 'utf8' });

    if (!status.trim()) {
      console.log('✅ 工作目录干净，没有需要提交的更改');
      process.exit(0);
    }

    console.log('🔄 开始自动提交流程...');

    // 添加所有更改到暂存区
    console.log('📁 添加文件到暂存区...');
    execSync('git add .', { stdio: 'inherit' });

    // 创建commit
    console.log('💾 创建commit...');
    const fullCommitMessage = `${commitMessage}

🤖 Generated with Claude Code (https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

    execSync(`git commit -m "${fullCommitMessage}"`, { stdio: 'inherit' });

    // 推送到远程仓库
    console.log('🚀 推送到GitHub...');
    execSync('git push origin main', { stdio: 'inherit' });

    console.log('✅ 自动commit和push完成！');
    console.log(`📝 Commit信息: ${commitMessage}`);

  } catch (error) {
    console.error('❌ Git操作失败:', error.message);
    process.exit(1);
  }

  // 阻止Claude继续处理这个消息
  process.exit(0);
}

// 如果不是commit指令，让Claude正常处理
process.exit(1);