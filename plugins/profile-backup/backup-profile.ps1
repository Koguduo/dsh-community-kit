# 备份 DSH profile 配置
#
# 用途：在安装/更新 DSH 插件前，把 profile 配置备份到归档区，避免被插件更新重写。
# 用法：powershell -ExecutionPolicy Bypass -File backup-profile.ps1
#       -ArchiveRoot 可选，默认 K:\AI\DeepSeek-Archive

param(
  [string]$ArchiveRoot = 'K:\AI\DeepSeek-Archive'
)

$ErrorActionPreference = 'Stop'
$ts = Get-Date -Format 'yyyyMMdd-HHmmss'
$dst = Join-Path $ArchiveRoot "configs\$ts"
New-Item -ItemType Directory -Force -Path $dst | Out-Null

$prof = $env:DSH_PROFILE_DIR
if (-not $prof) { throw 'DSH_PROFILE_DIR 未设置，请在 DSH 环境或手动指定 profile 目录' }

foreach ($f in @('cordis.patch.yml', 'package.json', 'pnpm-lock.yaml')) {
  $p = Join-Path $prof $f
  if (Test-Path -LiteralPath $p) {
    Copy-Item -LiteralPath $p -Destination $dst -Force
    Write-Output "copied $f"
  }
}
if ($env:DSH_HOME) {
  $cred = Join-Path $env:DSH_HOME '.credentials.yaml'
  if (Test-Path -LiteralPath $cred) {
    Copy-Item -LiteralPath $cred -Destination $dst -Force
    Write-Output 'copied .credentials.yaml'
  }
}

Write-Output "backup -> $dst"