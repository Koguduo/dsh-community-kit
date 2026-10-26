# DSH Community Kit

> 面向 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) 的社区工具包：常用插件、自动化脚本与安全文档。
>
> ⚠️ **非官方项目**，与 DeepSeek 官方无关，不代表官方背书。

## 包含内容

| 目录 | 说明 |
|---|---|
| `plugins/modelscope-daily/` | 魔搭(ModelScope)每日魔粒自动领取：Playwright 专用浏览器配置 + Windows 计划任务；登录态与日志默认放 `K:\AI\DSH-Automation`，不占 C 盘 |
| `plugins/profile-backup/` | 安装/更新 DSH 插件前自动备份 profile 配置，避免被插件更新覆盖（血泪教训） |
| `docs/` | 安装与安全说明 |

## 快速开始

### 1. 前置条件

- Windows 10/11
- DSH Desktop（0.2.x）
- Node.js 22+（DSH 自带 runtime 亦可）
- 魔搭脚本额外需要 Edge 浏览器（脚本用 `channel: 'msedge'`）

### 2. 魔搭每日魔粒自动领取

```powershell
# 登录一次（会弹出专用浏览器窗口，扫码/短信登录后自动关闭）
node plugins\modelscope-daily\login.mjs

# 手动验证一轮（有头，能看到它点了什么）
node plugins\modelscope-daily\daily.mjs --headed --dump

# 注册每天 08:30 的计划任务
powershell -ExecutionPolicy Bypass -File plugins\modelscope-daily\install-task.ps1
```

魔粒规则：每天登录送 200，绑定阿里云 +50，共 250/天，**当日有效**。

### 3. 插件安装前备份配置

```powershell
powershell -ExecutionPolicy Bypass -File plugins\profile-backup\backup-profile.ps1
# 备份到 K:\AI\DeepSeek-Archive\configs\<时间戳>\
```

建议把这条命令固定在"安装/更新任何 DSH 插件之前"。

## 安全声明（务必阅读）

1. **插件以你的用户权限运行**，安装前请阅读源码；只安装你信任的代码。
2. 本仓库**不包含**任何 API Key、token 或登录态；`.gitignore` 已排除凭据与浏览器 profile。
3. DSH 默认权限预设可能是 `danger-full-access`（可读写文件、执行命令），请按需收敛。
4. 免费模型（如 Token Harbor 的 `:free` 模型、魔搭免费额度）的数据政策可能与付费不同，**不要发送敏感内容**。
5. 本仓库脚本仅用于本地自动化，请自行遵守各平台服务条款。

## License

MIT