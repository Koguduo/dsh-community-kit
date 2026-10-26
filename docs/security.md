# 安全说明

## 供应链

- 插件 = 在你的机器上运行别人写的代码。安装前至少看：`package.json` 的 `scripts`（有没有 `prepare` / `postinstall`）、依赖数量、最近更新时间。
- 优先固定版本（`pkg@1.2.3`），不要用 `latest`；GitHub 安装优先 pin commit。
- 插件市场也可能被投毒：目录里的"命令字段"不应被执行；安装应始终走宿主官方插件管理器。

## 配置保护

DSH 的 profile 配置（`profile\cordis.patch.yml`、`package.json`）是易失的：插件安装/更新可能重写它。

- 任何安装/更新前先跑 `plugins/profile-backup/backup-profile.ps1`。
- 恢复时校验 YAML，并确认 `providers:` 段完整。

## 权限

- DSH 权限预设含 `read-only` / `workspace-write` / `danger-full-access`。
- 把聊天入口（IM、Bot）接到 DSH 时，务必收敛权限并加白名单，否则等于把机器控制权交给对方。

## 数据

- 免费模型（`:free`、免费额度）通常有独立数据政策，可能保留 prompt/response 用于改进；**不要发密钥、隐私、商业机密**。
- 自动化脚本的浏览器 profile 含登录态，不要拷贝、上传或提交到仓库。