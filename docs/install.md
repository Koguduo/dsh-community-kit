# 安装与使用

## 1. 直接作为脚本使用（推荐先这样）

```powershell
git clone https://github.com/Koguduo/dsh-community-kit.git
cd dsh-community-kit
node plugins\modelscope-daily\login.mjs
node plugins\modelscope-daily\daily.mjs --headed --dump
```

## 2. 作为 DSH 插件安装（本地目录）

DSH Desktop：

1. 打开 **插件** 页 → **+ 添加插件**
2. 选择 **本地目录**，指向本仓库中的插件目录（例如 `plugins\modelscope-daily`）
3. 安装 → 按提示重启 DSH

> 桌面端的 profile 由 Electron 管理，**不要用 CLI 直接改**；具体以 DSH 插件管理界面为准。

## 3. 定时执行

```powershell
powershell -ExecutionPolicy Bypass -File plugins\modelscope-daily\install-task.ps1
Get-ScheduledTask -TaskName DSH-ModelScope-Daily | Get-ScheduledTaskInfo
```

日志：`K:\AI\DSH-Automation\logs\`（可用 `DSH_AUTOMATION_DIR` 覆盖）。

## 4. 常见问题

- **NEED_LOGIN**：登录态过期，重跑 `login.mjs`。
- **找不到签到按钮**：用 `--dump` 保存页面文本/截图，按实际文案调整 `daily.mjs` 里的正则。
- **想换日志/配置位置**：设置环境变量 `DSH_AUTOMATION_DIR`。