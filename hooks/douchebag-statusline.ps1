# douchebag — statusline badge script for Claude Code (Windows PowerShell)
# Reads the douchebag mode flag file and outputs a colored badge.

$ErrorActionPreference = 'SilentlyContinue'

$configDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME '.claude' }
$flag = Join-Path $configDir '.douchebag-active'

if (-not (Test-Path -LiteralPath $flag -PathType Leaf)) { exit 0 }

$item = Get-Item -LiteralPath $flag -Force
if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) { exit 0 }
if ($item.Length -gt 64) { exit 0 }

$raw = (Get-Content -LiteralPath $flag -Raw -TotalCount 64 -ErrorAction SilentlyContinue)
if (-not $raw) { exit 0 }
$mode = ($raw -replace '[^a-z0-9-]', '').ToLower()

$valid = @('off','normal','full','ultra','commit','review')
if ($valid -notcontains $mode) { exit 0 }

$esc = [char]27
$magenta = "$esc[38;5;165m"
$reset = "$esc[0m"

if (-not $mode -or $mode -eq 'normal') {
  Write-Host -NoNewline "$magenta[DOUCHEBAG]$reset"
} else {
  $suffix = $mode.ToUpper()
  Write-Host -NoNewline "$magenta[DOUCHEBAG:$suffix]$reset"
}
