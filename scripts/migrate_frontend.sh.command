#!/bin/bash

# Updated migration script for Conway's Game of Life frontend

echo "========================================"
echo "Conway's Game of Life Frontend"
echo "========================================"
echo ""

cd "$(dirname "$0")/.."

echo "📦 Installing dependencies..."
cd frontend

# Remove old files if they exist
if [ -f "src/App.jsx" ]; then
    echo "  Removing old App.jsx..."
    rm src/App.jsx
fi

if [ -f "vite.config.js" ]; then
    echo "  Removing old vite.config.js..."
    rm vite.config.js
fi

# Install dependencies
echo "  Running npm install..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎮 Conway's Game of Life Features:"
echo "  ✓ 120×60 interactive grid (7200 cells)"
echo "  ✓ Alien/Weyland terminal aesthetic"
echo "  ✓ Visible computation cursor with trails"
echo "  ✓ Hover to draw living cells"
echo "  ✓ Speed controls and presets"
echo "  ✓ Backend status integration"
echo ""
echo "🎯 Controls:"
echo "  • Click or [Space] - Pause/resume"
echo "  • [R] - Reseed random pattern"
echo "  • [↑/↓] - Adjust speed"
echo "  • [1/2/3] - Speed presets"
echo "  • Mouse hover - Draw cells"
echo ""
echo "🚀 To test locally:"
echo "  cd frontend"
echo "  npm run dev"
echo "  Visit: http://localhost:5173"
echo ""
echo "📦 To deploy:"
echo "  cd .."
echo "  ./scripts/deploy_gcp.sh"
echo ""
echo "🎨 Design inspired by Alien (1979) terminals"
echo "   - Green phosphor CRT aesthetic"
echo "   - Retro-futuristic UI"
echo "   - Scanlines and glow effects"
echo ""
