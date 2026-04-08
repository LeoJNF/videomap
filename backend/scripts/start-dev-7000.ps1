$ErrorActionPreference = 'Stop'

$backendPath = Split-Path -Parent $PSScriptRoot
$logPath = Join-Path $backendPath 'dev-7000.log'

Set-Location -Path $backendPath

$env:PORT = '7000'

"Starting backend on PORT=$env:PORT" | Out-File -FilePath $logPath -Encoding utf8

# Keep running; append logs to dev-7000.log
npm run start:dev *>> $logPath
