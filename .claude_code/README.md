# Claude Code 自动Commit配置

这个目录包含Claude Code的hooks配置，实现了自动commit功能。

## 使用方法

当你想要commit代码时，只需要输入：
```
commit：[你的版本说明]
```

系统会自动：
1. 添加所有更改到暂存区 (git add .)
2. 创建commit with 你的版本说明
3. 推送到GitHub远程仓库 (git push origin main)

## 配置文件

- `settings.json`: Claude Code hooks配置
- `commit-hook.js`: 处理commit指令的脚本

配置完成时间：${new Date().toLocaleString('zh-CN')}