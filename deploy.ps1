# Manual deployment script for GitHub Pages (PowerShell)
# This builds the app directly to root directory for GitHub Pages

Write-Host "Building the Vue.js app to root directory..." -ForegroundColor Green
npm run build

Write-Host "Build complete! Files are now in root directory." -ForegroundColor Green
Write-Host "Commit and push these files to GitHub:" -ForegroundColor Yellow
Write-Host "  - index.html (built version)" -ForegroundColor White
Write-Host "  - assets/ folder" -ForegroundColor White
Write-Host ""
Write-Host "Commands to deploy:" -ForegroundColor Cyan
Write-Host "  git add index.html assets/" -ForegroundColor White
Write-Host "  git commit -m 'Deploy Vue.js app'" -ForegroundColor White
Write-Host "  git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "Then go to GitHub repo Settings > Pages and set Source to 'Deploy from a branch' > 'main' > '/ (root)'" -ForegroundColor Yellow
Write-Host "Your app will be available at: https://justforfun0906.github.io/MCHackerthon/" -ForegroundColor Cyan