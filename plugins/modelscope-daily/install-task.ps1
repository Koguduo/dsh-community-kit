# Register a daily Windows scheduled task: ModelScope daily credits
# Usage (repo root): powershell -ExecutionPolicy Bypass -File plugins\modelscope-daily\install-task.ps1
# ASCII-only on purpose: Windows PowerShell 5.1 reads BOM-less .ps1 as ANSI.

$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$taskName = 'DSH-ModelScope-Daily'

$node = Join-Path $env:DSH_HOME 'dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe'
if (-not (Test-Path -LiteralPath $node)) {
  $node = 'C:\Users\Kogud\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe'
}
if (-not (Test-Path -LiteralPath $node)) {
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if (-not $cmd) { throw 'node.exe not found. Install Node.js or run from DSH runtime.' }
  $node = $cmd.Source
}

$scriptPath = Join-Path $here 'daily.mjs'
if (-not (Test-Path -LiteralPath $scriptPath)) { throw "missing $scriptPath" }

$action = New-ScheduledTaskAction -Execute $node -Argument ('"' + $scriptPath + '"') -WorkingDirectory (Split-Path $here -Parent)
$trigger = New-ScheduledTaskTrigger -Daily -At '08:30'
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 15)
$desc = 'ModelScope daily credits (login + claim)'

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description $desc -Force | Out-Null

Write-Output "registered task: $taskName"
Write-Output '  trigger: daily 08:30 (runs on missed start when available)'
Write-Output "  node:   $node"
Write-Output "  script: $scriptPath"
Write-Output '  logs:   K:\AI\DSH-Automation\logs'
Write-Output ''
Write-Output 'Run now:   Start-ScheduledTask -TaskName DSH-ModelScope-Daily'
Write-Output 'Info:      Get-ScheduledTask -TaskName DSH-ModelScope-Daily | Get-ScheduledTaskInfo'
Write-Output 'Remove:    Unregister-ScheduledTask -TaskName DSH-ModelScope-Daily -Confirm:$false'