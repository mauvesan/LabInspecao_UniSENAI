param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectRoot
)

$ErrorActionPreference = 'Stop'
$packageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$filesRoot = Join-Path $packageRoot 'files'

if (-not (Test-Path (Join-Path $ProjectRoot 'package.json'))) {
  throw "A pasta informada não parece ser a raiz do LabInspeção: $ProjectRoot"
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $ProjectRoot ".release-backups\v4.1.0-$stamp"
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

$relativeFiles = @(
  'src\main.js',
  'src\styles\tokens.css',
  'src\styles\didactic-legibility.css',
  'src\app\routing\create-route-renderer.js'
)

foreach ($relative in $relativeFiles) {
  $source = Join-Path $filesRoot $relative
  $target = Join-Path $ProjectRoot $relative
  $backup = Join-Path $backupRoot $relative

  if (-not (Test-Path $source)) {
    throw "Arquivo ausente no pacote: $source"
  }

  if (Test-Path $target) {
    New-Item -ItemType Directory -Path (Split-Path $backup -Parent) -Force | Out-Null
    Copy-Item $target $backup -Force
  }

  New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force | Out-Null
  Copy-Item $source $target -Force
}

Write-Host 'v4.1.0 aplicada com sucesso.' -ForegroundColor Green
Write-Host "Backup criado em: $backupRoot"
Write-Host 'Execute: npm run check; npm run build; npm run dev'
