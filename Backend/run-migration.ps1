# Script para ejecutar migración de Prisma sin shadow database

Write-Host "🔧 Configurando migración..." -ForegroundColor Cyan

# Configurar variable de entorno para deshabilitar shadow database
$env:PRISMA_MIGRATE_SKIP_GENERATE = "true"

Write-Host "📁 Directorio actual: $(Get-Location)" -ForegroundColor Yellow

# Ejecutar migración
Write-Host "🚀 Ejecutando migración..." -ForegroundColor Green
npx prisma migrate deploy

Write-Host "" 
Write-Host "✅ Migración aplicada!" -ForegroundColor Green
Write-Host "🔄 Generando cliente Prisma..." -ForegroundColor Cyan

# Generar cliente Prisma
npx prisma generate

Write-Host ""
Write-Host "✨ ¡Todo listo! Ahora puedes iniciar el servidor:" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor Yellow

