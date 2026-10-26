# 魔搭(ModelScope) 每日魔粒自动领取

> 魔粒规则：每天登录送 200，绑定阿里云再 +50，共 250/天，当日有效、不用清零。
> 本方案用 Playwright 驱动一个专用 Edge profile，每天登录一次并尝试点「签到/领取」，
> 由 Windows 任务计划定时执行，登录态和日志都留在本机（K 盘）。

## 一次性准备

```powershell
cd K:\AI\Github.cli\dsh-community-kit

# 1) 登录一次（会弹出浏览器窗口，扫码/短信登录，成功后自动关闭）
node plugins\modelscope-daily\login.mjs

# 2) 手动验证一轮（有头，能亲眼看到它点了什么）
node plugins\modelscope-daily\daily.mjs --headed --dump

# 3) 注册每天 08:30 的计划任务
powershell -ExecutionPolicy Bypass -File plugins\modelscope-daily\install-task.ps1
```

## 文件说明

| 文件 | 作用 |
|---|---|
| `login.mjs` | 首次登录，登录态写入专用 profile |
| `daily.mjs` | 每日执行：打开 `/my/overview` → 读魔粒数 → 点签到/领取 → 复核余额变化 → 写日志 |
| `install-task.ps1` | 注册/更新 Windows 计划任务（每天 08:30，错过开机补跑） |
| `run-daily.cmd` | 备用入口（手动/调试用） |

## 数据位置（本机，不进仓库）

```
K:\AI\DSH-Automation\
├─ modelscope-profile\     # 专用浏览器 profile（含登录态，别拷贝/上传）
└─ logs\                   # YYYY-MM-DD.log、task.log；失败时 error.png
```

`--dump` 会把页面文本/HTML/截图写到 `K:\AI\DSH-Automation\`，用于排查选择器。
可用环境变量 `DSH_AUTOMATION_DIR` 改到别处。

## 日志判读

- `RESULT: CLAIMED` — 找到了并点了「签到/领取」
- `RESULT: VISITED_ONLY` — 没找到按钮（很可能登录即自动发放 200，属正常）
- `NEED_LOGIN` — 登录态失效，重跑 `login.mjs` 即可（通常几个月一次）

## 注意

- 这是网页自动化（等价于手动开浏览器登录），不是调 API；改版可能让选择器失效，届时用 `--dump` 重新对按钮文案（脚本已支持「签到/领取」多文案兜底）。
- 不要把这个目录提交到任何仓库；`modelscope-profile` 里有你的登录态。