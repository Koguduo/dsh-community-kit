# 注册/更新 Windows 任务计划：每天 08:30 自动领魔粒
# 用法（在仓库根目录）： powershell -ExecutionPolicy Bypass -File plugins\modelscope-daily\install-task.ps1

$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$taskName = 'DSH-ModelScope-Daily'

$node = Join-Path $env:DSH_HOME 'dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe'
if (-not (Test-Path -LiteralPath $node)) {
  $node = 'C:\Users\Kogud\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe'
}
if (-not (Test-Path -LiteralPath $node)) {
  $c = Get-Command node -ErrorAction SilentlyContinue
  if (-not $c) { throw '找不到 node.exe，请先确认 Node 可用' }
  $node = $c.Source
}

$script = Join-Path $here 'daily.mjs'
if (-not (Test-Path -LiteralPath $script)) { throw "找不到 $script" }

$action = New-ScheduledTaskAction -Execute $node -Argument ('"' + $script + '"') -WorkingDirectory (Split-Path $here -Parent)
$trigger = New-ScheduledTaskTrigger -Daily -At '08:30'
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 15)
$desc = '魔搭(ModelScope)每日登录领取魔粒；日志见 K:\AI\DSH-Automation\logs'

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description $desc -Force | Out-Null
Write-Output "已注册任务: $taskName"
Write-Output '  触发: 每天 08:30（错过后开机补跑）'
Write-Output "  命令: `"$node`" `"$script`""
Write-Output '  日志: K:\AI\DSH-Automation\logs'
Write-Output ''
Write-Output '手动试跑:  Start-ScheduledTask -TaskName DSH-ModelScope-Daily'
Write-Output '查看状态:  Get-ScheduledTask -TaskName DSH-ModelScope-Daily | Get-ScheduledTaskInfo'
Write-Output '删除任务:  Unregister-ScheduledTask -TaskName DSH-ModelScope-Daily -Confirm:$false'