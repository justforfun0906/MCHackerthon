# 迷你打工 Vue.js App

A mini job application built with Vue.js designed for 128x160 cloud phone displays.

## Features

- 👤 User profile with level and coins system
- 📋 Job list with progress tracking
- 💰 Reward system for completed jobs
- 📱 Optimized for 128x160 cloud phone screens
- ⚡ Real-time progress updates

## Development

### Prerequisites
- Node.js (v16 or higher)
- npm

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Deployment to GitHub Pages

This project is configured to build to the `docs/` folder, which GitHub Pages supports.

#### Quick Deployment Steps:
1. **Build the app**: `npm run build` (this creates files in `docs/` folder)
2. **Commit the built files**:
   ```bash
   git add docs/
   git commit -m "Deploy Vue.js app to docs"
   git push origin main
   ```
3. **Configure GitHub Pages**:
   - Go to your GitHub repository
   - Settings → Pages 
   - Set Source to "Deploy from a branch"
   - Select branch: `main`
   - Select folder: `/docs`
   - Save

4. **Access your app**: `https://justforfun0906.github.io/MCHackerthon/`

#### Using Deployment Script:
```powershell
# Windows PowerShell
.\deploy.ps1

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### File Structure for Deployment
```
├── docs/               ← Built files for GitHub Pages
│   ├── index.html      ← Production HTML
│   └── assets/         ← CSS/JS bundles
├── src/                ← Source code
├── index.html          ← Development HTML
└── package.json        ← Dependencies
```

### Deployment
The app is optimized for cloud phone environments with:
- Fixed 128x160 viewport dimensions
- Touch-friendly interface
- Lightweight bundle size
- Network accessible server (0.0.0.0:3000)

### File Structure
```
├── index.html          # Main HTML file
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── src/
    ├── main.js         # Vue app entry point
    ├── App.vue         # Main application component
    └── style.css       # Global styles
```

## Original Features Ported
All functionality from the original `mainPage.html` has been converted to Vue.js:
- Reactive user data (level, coins, experience)
- Interactive job system with progress tracking
- Modal dialogs for job confirmation
- Real-time clock display
- Tab navigation system
- Auto-completing jobs with rewards

## Usage
1. View available jobs in the main list
2. Click on a job to start it
3. Watch progress bars fill automatically
4. Earn coins and experience points
5. Level up as you complete more jobs

The app runs on `http://localhost:3000` in development mode and can be accessed from any device on the network for cloud phone testing.