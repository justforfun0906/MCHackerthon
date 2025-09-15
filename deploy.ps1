# Manual deployment script for GitHub Pages (PowerShell)
# This builds the app to docs/ folder for GitHub Pages

Write-Host "Building the Vue.js app to docs/ folder..." -ForegroundColor Green
npm run build

Write-Host "Build complete! Files are now in docs/ directory." -ForegroundColor Green
Write-Host "Commit and push these files to GitHub:" -ForegroundColor Yellow
Write-Host "  - docs/ folder (contains index.html and assets/)" -ForegroundColor White
Write-Host ""
Write-Host "Commands to deploy:" -ForegroundColor Cyan
Write-Host "  git add docs/" -ForegroundColor White
Write-Host "  git commit -m 'Deploy Vue.js app to docs'" -ForegroundColor White
Write-Host "  git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "Then go to GitHub repo Settings > Pages and set:" -ForegroundColor Yellow
Write-Host "  Source: 'Deploy from a branch'" -ForegroundColor White
Write-Host "  Branch: 'main'" -ForegroundColor White
Write-Host "  Folder: '/docs'" -ForegroundColor White
Write-Host ""
Write-Host "Your app will be available at: https://justforfun0906.github.io/MCHackerthon/" -ForegroundColor Cyan