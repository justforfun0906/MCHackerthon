#!/bin/bash

# Manual deployment script for GitHub Pages
# Run this if you want to deploy manually instead of using GitHub Actions

echo "Building the Vue.js app..."
npm run build

echo "Copying dist files to root for GitHub Pages..."
cp dist/index.html ./
cp -r dist/assets ./

echo "Deployment files ready! Commit and push to GitHub."
echo "Your app will be available at: https://justforfun0906.github.io/MCHackerthon/"