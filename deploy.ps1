# Manual deployment script for GitHub Pages (PowerShell)
# Run this if you want to deploy manually instead of using GitHub Actions

Write-Host "Building the Vue.js app..." -ForegroundColor Green
npm run build

Write-Host "Copying dist files to root for GitHub Pages..." -ForegroundColor Green
Copy-Item "dist/index.html" "./" -Force
if (Test-Path "./assets") {
    Remove-Item "./assets" -Recurse -Force
}
Copy-Item "dist/assets" "./" -Recurse -Force

Write-Host "Deployment files ready! Commit and push to GitHub." -ForegroundColor Yellow
Write-Host "Your app will be available at: https://justforfun0906.github.io/MCHackerthon/" -ForegroundColor Cyan