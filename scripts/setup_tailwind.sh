#!/bin/bash

# Setup Tailwind CSS for Conway's Game of Life frontend

echo "========================================"
echo "Setting up Tailwind CSS"
echo "========================================"
echo ""

cd "$(dirname "$0")/../frontend"

echo "📦 Installing Tailwind CSS and dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎨 Tailwind CSS is now configured"
echo ""
echo "📁 Files created:"
echo "  ✓ tailwind.config.js"
echo "  ✓ postcss.config.js"
echo "  ✓ src/index.css (Tailwind imports)"
echo ""
echo "🚀 To start the dev server:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "  Visit: http://localhost:5173"
echo ""
echo "⚠️  Important: Stop and restart your dev server if it's running!"
echo "   Press Ctrl+C in the terminal running 'npm run dev'"
echo "   Then run 'npm run dev' again"
echo ""
