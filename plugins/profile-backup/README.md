# profile-backup

安装/更新 DSH 插件前，把 profile 配置备份到归档区。

## 用法

```powershell
powershell -ExecutionPolicy Bypass -File backup-profile.ps1
# 可选：-ArchiveRoot D:\my-backups
```

备份内容：`cordis.patch.yml`、`package.json`、`pnpm-lock.yaml`、`.credentials.yaml`
输出位置：`<ArchiveRoot>\configs\<yyyyMMdd-HHmmss>\`

## 为什么需要

DSH 的 profile 配置会被插件安装/更新过程重写。曾出现过插件更新后 `providers` 段被清空、模型选择器全部消失的情况；有备份就能一条命令恢复。