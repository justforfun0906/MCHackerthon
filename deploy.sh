#!/bin/bash

# Manual deployment script for GitHub Pages
# This builds the app directly to root directory for GitHub Pages

echo "Building the Vue.js app to root directory..."
npm run build

echo "Build complete! Files are now in root directory."
echo "Commit and push these files to GitHub:"
echo "  - index.html (built version)"
echo "  - assets/ folder"
echo ""
echo "Commands to deploy:"
echo "  git add index.html assets/"
echo "  git commit -m 'Deploy Vue.js app'"
echo "  git push origin main"
echo ""
echo "Then go to GitHub repo Settings > Pages and set Source to 'Deploy from a branch' > 'main' > '/ (root)'"
echo "Your app will be available at: https://justforfun0906.github.io/MCHackerthon/"