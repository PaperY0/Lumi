$ErrorActionPreference = 'Stop'

Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)

Write-Host "`nLumi 本地部署向导`n" -ForegroundColor Cyan

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  throw '未找到 pnpm。请先安装 Node.js 和 pnpm。'
}

$deepseekKey = Read-Host 'DeepSeek API Key（直接回车则使用 MOCK 模式）'
$mockMode = if ([string]::IsNullOrWhiteSpace($deepseekKey)) { 'true' } else { 'false' }
$mineruToken = Read-Host 'MinerU Token（可选，直接回车跳过）'
$zhihuSecret = Read-Host '知乎 OpenAPI Secret（可选，直接回车跳过）'
$aiRateLimit = Read-Host '本地 AI 每 15 分钟最多请求次数（直接回车使用 300）'
if ([string]::IsNullOrWhiteSpace($aiRateLimit)) { $aiRateLimit = '300' }

$backendEnv = @"
DEEPSEEK_API_KEY=$deepseekKey
MOCK_MODE=$mockMode
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:8080
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AI_RATE_LIMIT_MAX=$aiRateLimit
ZHIHU_ACCESS_SECRET=$zhihuSecret
ZHIHU_SEARCH_RATE_LIMIT_MAX=12
MINERU_TOKEN=$mineruToken
"@

$frontendEnv = 'VITE_AI_API_BASE=http://localhost:3001' + [Environment]::NewLine
Set-Content -LiteralPath 'backend\.env' -Value $backendEnv -Encoding utf8
Set-Content -LiteralPath 'frontend\.env.local' -Value $frontendEnv -Encoding utf8

Write-Host "`n正在安装依赖..." -ForegroundColor Yellow
pnpm install

Write-Host "`n正在打开后端和前端服务窗口..." -ForegroundColor Green
Start-Process pwsh -ArgumentList '-NoExit', '-Command', "Set-Location -LiteralPath '$PWD'; pnpm dev:server"
Start-Process pwsh -ArgumentList '-NoExit', '-Command', "Set-Location -LiteralPath '$PWD'; pnpm dev -- --host localhost"

Write-Host "`n部署完成：" -ForegroundColor Green
Write-Host '前端：http://localhost:5173'
Write-Host '后端：http://localhost:3001/api/health'
Write-Host "模式：$(if ($mockMode -eq 'true') { 'MOCK（未填写 DeepSeek Key）' } else { 'AI（DeepSeek）' })"
