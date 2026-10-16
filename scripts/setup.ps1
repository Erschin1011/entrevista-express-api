$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $ProjectRoot

foreach ($Command in @('node', 'npm')) {
    if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
        throw "$Command no está en PATH. Instala Node.js LTS desde https://nodejs.org/ y reinicia PowerShell."
    }
}

$NodeMajor = [int](& node -p "parseInt(process.versions.node.split('.')[0], 10)")
if ($NodeMajor -lt 20) { throw "Se requiere Node.js 20 o superior; se detectó Node.js $NodeMajor." }

Write-Host '==> Instalando dependencias fijadas en package-lock.json' -ForegroundColor Cyan
npm ci
if ($LASTEXITCODE -ne 0) { throw 'npm ci falló.' }

Write-Host '==> Ejecutando pruebas iniciales' -ForegroundColor Cyan
npm test
if ($LASTEXITCODE -ne 0) { throw 'Las pruebas no pasaron.' }

Write-Host ''
Write-Host 'Listo. Inicia la API con: npm run dev' -ForegroundColor Green
Write-Host 'Health check: http://localhost:3000/health' -ForegroundColor Green
