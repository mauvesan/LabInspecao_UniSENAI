param([Parameter(Mandatory=$true)][string]$ProjectRoot)
$ErrorActionPreference = 'Stop'
$backupRoot = Join-Path $ProjectRoot '.release-backups'
$backup = Get-ChildItem $backupRoot -Directory -Filter 'v4.0.4-*' | Sort-Object Name -Descending | Select-Object -First 1
if (-not $backup) { throw 'Nenhum backup da v4.0.4 foi encontrado.' }
Get-ChildItem $backup.FullName -Recurse -File | Where-Object { $_.Name -ne 'release.txt' } | ForEach-Object {
  $relative = $_.FullName.Substring($backup.FullName.Length + 1)
  $target = Join-Path $ProjectRoot $relative
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null
  Copy-Item $_.FullName $target -Force
}
Write-Host "Rollback concluído usando: $($backup.FullName)"
