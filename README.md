# 迷你打工 - Mini Job App

A modular 128x160 mini job application built with Vue.js 3 using CDN and organized file structure for easy GitHub Pages deployment.

## Features

- 👤 User profile with level and coins system
- 📋 Interactive job list with progress tracking
- 💰 Reward system for completed jobs
- 📱 Optimized for 128x160 cloud phone screens
- ⚡ Real-time progress updates
- 🎯 Modular Vue.js components for maintainability

## Project Structure

```
MCHackerthon/
├── index.html              ← Main HTML file
├── css/                    ← Stylesheets
│   ├── reset.css          ← CSS reset and base styles
│   ├── main.css           ← Main layout styles
│   └── components.css     ← Component-specific styles
├── js/                    ← JavaScript files
│   └── app.js             ← Main app initialization
├── components/            ← Vue.js components
│   ├── StatusBar.js       ← Top status bar component
│   ├── UserCard.js        ← User profile card component
│   ├── JobSection.js      ← Job list and management
│   ├── BottomNav.js       ← Bottom navigation component
│   ├── Modal.js           ← Modal dialog component
│   └── MiniJobApp.js      ← Main app component
├── README.md              ← Documentation
└── LICENSE                ← License file
```

## Deployment to GitHub Pages

### Quick Setup:
1. **Upload files**: Commit all files to your GitHub repository
2. **Configure GitHub Pages**:
   - Go to your GitHub repository
   - Settings → Pages 
   - Set Source to "Deploy from a branch"
   - Select branch: `main`
   - Select folder: `/ (root)`
   - Save

3. **Access your app**: `https://yourusername.github.io/repositoryname/`

### Simple Commands:
```bash
git add .
git commit -m "Deploy modular Vue.js mini job app"
git push origin main
```

## Component Overview

### Core Components
- **StatusBar**: Displays app title and current time
- **UserCard**: Shows user avatar, level, coins, and experience progress
- **JobSection**: Lists available jobs with progress tracking
- **BottomNav**: Navigation tabs for different app sections
- **Modal**: Confirmation dialogs for job actions
- **MiniJobApp**: Main app component that orchestrates everything

### Features
- **Modular Design**: Each component is in its own file for easy maintenance
- **Event Communication**: Components communicate through Vue's emit system
- **Reactive State**: User data and job progress update in real-time
- **Responsive UI**: Optimized for 128x160 pixel displays

## Technical Details

- **Framework**: Vue.js 3 (CDN-based)
- **Architecture**: Component-based with separation of concerns
- **CSS Organization**: Split into logical files (reset, main, components)
- **Browser Support**: All modern browsers
- **Dependencies**: None (except Vue.js CDN)
- **Size**: Small footprint (~15KB total)

## Local Development

Simply open `index.html` in any modern web browser. No build process or server required!

## GitHub Pages Compatibility

✅ **Perfect for GitHub Pages**:
- No build process required
- Modular file organization
- CDN-based dependencies
- Works immediately after upload
- Easy to maintain and extend

This project demonstrates a clean, modular Vue.js application structure that's both maintainable and perfectly suited for GitHub Pages deployment.

