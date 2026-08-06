param([Parameter(Mandatory=$true)][string]$ProjectRoot)
$ErrorActionPreference = 'Stop'
$PackageRoot = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $ProjectRoot 'package.json'))) { throw 'ProjectRoot não aponta para uma raiz válida.' }
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backup = Join-Path $ProjectRoot ".release-backups\\v4.0.4-$stamp"
$files = @(
  'src/app/views/home-view.js',
  'src/modules/registry.js',
  'src/modules/produtos-perigosos/content.js',
  'src/modules/produtos-perigosos/decision.css',
  'src/modules/produtos-perigosos/decision.js',
  'src/modules/produtos-perigosos/index.js',
  'src/modules/produtos-perigosos/module.json',
  'src/modules/produtos-perigosos/quiz.json',
  'src/modules/produtos-perigosos/simulation.js'
)
foreach ($relative in $files) {
  $target = Join-Path $ProjectRoot $relative
  if (Test-Path $target) {
    $backupFile = Join-Path $backup $relative
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $backupFile) | Out-Null
    Copy-Item $target $backupFile -Force
  }
  $source = Join-Path (Join-Path $PackageRoot 'files') $relative
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null
  Copy-Item $source $target -Force
}
Set-Content -Path (Join-Path $backup 'release.txt') -Value 'v4.0.4' -Encoding UTF8
Write-Host 'v4.0.4 aplicada com sucesso.'
Write-Host "Backup criado em: $backup"
Write-Host 'Execute: npm run check'
