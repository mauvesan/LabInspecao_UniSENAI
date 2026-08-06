param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectRoot,
  [Parameter(Mandatory = $true)]
  [string]$BackupRoot
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path $BackupRoot)) { throw "Backup não encontrado: $BackupRoot" }

Get-ChildItem $BackupRoot -Recurse -File | ForEach-Object {
  $relative = $_.FullName.Substring($BackupRoot.Length).TrimStart('\\')
  $target = Join-Path $ProjectRoot $relative
  New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force | Out-Null
  Copy-Item $_.FullName $target -Force
}

$addedCss = Join-Path $ProjectRoot 'src\styles\didactic-legibility.css'
$backupCss = Join-Path $BackupRoot 'src\styles\didactic-legibility.css'
if ((Test-Path $addedCss) -and -not (Test-Path $backupCss)) { Remove-Item $addedCss -Force }

Write-Host 'Rollback concluído.' -ForegroundColor Yellow
