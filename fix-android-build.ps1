# Fix Android Build - Complete Clean & Rebuild
# This script resolves CMake codegen errors by regenerating the Android project

Write-Host "🧹 Step 1: Cleaning Android build artifacts..." -ForegroundColor Cyan
if (Test-Path "android") {
    Remove-Item -Recurse -Force android -ErrorAction SilentlyContinue
    Write-Host "✓ Removed android folder" -ForegroundColor Green
}

Write-Host "`n🧹 Step 2: Cleaning node_modules..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    Write-Host "✓ Removed node_modules" -ForegroundColor Green
}

Write-Host "`n🧹 Step 3: Cleaning Expo cache..." -ForegroundColor Cyan
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
    Write-Host "✓ Removed .expo cache" -ForegroundColor Green
}

Write-Host "`n📦 Step 4: Reinstalling dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔨 Step 5: Regenerating Android project..." -ForegroundColor Cyan
npx expo prebuild --platform android --clean
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Android project regenerated" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to regenerate Android project" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Build fix complete! You can now run:" -ForegroundColor Green
Write-Host "   npx expo run:android" -ForegroundColor Yellow
