# 娉ㄥ唽/鏇存柊 Windows 浠诲姟璁″垝锛氭瘡澶?08:30 鑷姩棰嗛瓟绮?# 鐢ㄦ硶锛堝湪 workspace 鏍圭洰褰曪級锛?powershell -ExecutionPolicy Bypass -File modelscope-daily\install-task.ps1

$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$ws = Split-Path $here -Parent
$taskName = 'DSH-ModelScope-Daily'

$node = Join-Path $env:DSH_HOME 'dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe'
if (-not (Test-Path -LiteralPath $node)) {
  $node = 'C:\Users\Kogud\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe'
}
if (-not (Test-Path -LiteralPath $node)) {
  $c = Get-Command node -ErrorAction SilentlyContinue
  if (-not $c) { throw '鎵句笉鍒?node.exe锛岃鍏堢‘璁?Node 鍙敤' }
  $node = $c.Source
}

$script = Join-Path $here 'daily.mjs'
if (-not (Test-Path -LiteralPath $script)) { throw "鎵句笉鍒?$script" }

$action = New-ScheduledTaskAction -Execute $node -Argument ('"' + $script + '"') -WorkingDirectory $ws
$trigger = New-ScheduledTaskTrigger -Daily -At '08:30'
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 15)
$desc = '榄旀惌(ModelScope)姣忔棩鐧诲綍棰嗗彇榄旂矑锛涘け璐ユ棩蹇楄 K:\AI\DSH-Automation\logs'

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description $desc -Force | Out-Null
Write-Output "宸叉敞鍐屼换鍔? $taskName"
Write-Output "  瑙﹀彂: 姣忓ぉ 08:30锛堥敊杩囧悗寮€鏈鸿ˉ璺戯級"
Write-Output "  鍛戒护: `"$node`" `"$script`""
Write-Output "  宸ヤ綔鐩綍: $ws"
Write-Output "  鏃ュ織: $env:LOCALAPPDATA\dsh-automation\logs"
Write-Output ''
Write-Output '鎵嬪姩璇曡窇:  Start-ScheduledTask -TaskName DSH-ModelScope-Daily'
Write-Output '鏌ョ湅鐘舵€?  Get-ScheduledTask -TaskName DSH-ModelScope-Daily | Get-ScheduledTaskInfo'
Write-Output '鍒犻櫎浠诲姟:  Unregister-ScheduledTask -TaskName DSH-ModelScope-Daily -Confirm:$false'