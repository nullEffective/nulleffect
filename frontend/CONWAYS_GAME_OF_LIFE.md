# Conway's Game of Life Frontend - NullEffect Edition

## 🎮 What This Is

Your NullEffect frontend now features **Conway's Game of Life** with a stunning **Alien/Weyland-Yutani terminal aesthetic**!

### Features

🖥️ **Retro Terminal Design**
- Green phosphor CRT monitor look
- Scanlines and screen glow effects
- Monospace terminal fonts
- Parallax mouse tracking

🎮 **Interactive Conway's Game of Life**
- 120×60 cell grid (7200 cells)
- Live computation with visible cursor
- Phosphor trail effects showing processing
- **Hover to draw** living cells with your mouse!

⚡ **Performance Features**
- Smooth animations at 50ms tick rate
- Double-buffered rendering
- Efficient Uint8Array grid storage
- Incremental computation visualization

🎛️ **Controls**
- **Click or Space**: Pause/resume
- **R**: Reseed with random pattern
- **Arrow Up/Down**: Adjust speed
- **1/2/3**: Speed presets (slow/medium/fast)
- **Mouse hover**: Draw living cells

📊 **Backend Integration**
- Live backend status indicator
- Automatic ping every 10 seconds
- Shows connection status (ONLINE/OFFLINE/CONNECTING)

---

## 🚀 Quick Start

```bash
cd /Users/stephenleonard/git/nulleffect/nulleffect/frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Visit http://localhost:5173
```

---

## 🎨 Design Inspiration

**Alien (1979)** & **Aliens (1986)** - Weyland-Yutani Terminal Aesthetic:
- ✅ Green phosphor CRT monitors
- ✅ Monochrome emerald color scheme (#10b981)
- ✅ Retro-futuristic UI
- ✅ Boxy, industrial design
- ✅ Scanlines and screen artifacts
- ✅ Terminal-style typography

---

## 🕹️ How Conway's Game of Life Works

### The Rules
1. **Underpopulation**: Cell with <2 neighbors dies
2. **Survival**: Cell with 2-3 neighbors lives
3. **Overpopulation**: Cell with >3 neighbors dies
4. **Reproduction**: Dead cell with exactly 3 neighbors becomes alive

### This Implementation
- **Visible Computation**: Watch the cursor sweep across cells
- **Double Buffering**: Read from generation N, write to N+1
- **Phosphor Trails**: Fade effects show recently processed cells
- **Interactive**: Hover to toggle cells while running!

---

## ⚙️ Technical Details

### Grid Specifications
```typescript
COLS = 120
ROWS = 60  
CELL = 8px
TOTAL = 7,200 cells
```

### Speed Control
- **Default**: Complete one full generation in ~3 seconds
- **Range**: 0.01 to 72,000 cells/second
- **Presets**:
  - `1` key: Slow (720 cells/s, ~10s per generation)
  - `2` key: Medium (2,400 cells/s, ~3s per generation) [default]
  - `3` key: Fast (7,200 cells/s, ~1s per generation)

### Performance
- **Tick Rate**: 50ms between frames
- **Accumulator**: Fractional cell processing for smooth speeds
- **Trail Fade**: 1200ms phosphor afterglow
- **Memory**: ~14KB for grid buffers (2 × Uint8Array)

---

## 🎨 Color Scheme

**Primary**: Emerald/Green (#10b981, rgb(16, 185, 129))

```css
Background:    #000000 (pure black)
Text:          #a7f3d0 (emerald-200)
Bright:        #6ee7b7 (emerald-300)
Borders:       rgba(16,185,129,0.3)
Active Cells:  rgba(110,231,183,0.95)
Trails:        rgba(16,185,129,0.25) → fade
Glow:          rgba(16,185,129,0.10)
```

---

## 🧪 Built-in Tests

The component includes self-tests that run on load:

```typescript
// Test 1: Neighbor counting (blinker pattern)
// Test 2: One Conway step transformation
```

Check browser console for test results (harmless in production).

---

## 📊 UI Sections

### Top Bar
- **Logo**: NE//CORE with glowing indicator
- **Backend Status**: Live connection indicator
  - 🟡 Yellow = Connecting
  - 🟢 Green = Online
  - 🔴 Red = Offline

### Header Panel
- System identification
- "nullEffect" title with blinking cursor
- Timestamp and route info
- Backend URL

### Main Panel (Life Sim)
- Conway's Game of Life canvas
- Control buttons
- Status display (generation, progress, speed)

---

## 🎮 Interaction Guide

### Drawing Patterns

**Glider** (moves diagonally):
```
  █
   █
███
```

**Blinker** (oscillates):
```
███
```
becomes
```
 █
 █
 █
```

**Toad** (oscillates):
```
 ███
███
```

**Glider Gun** (creates gliders):
- Reseed until you see one naturally form
- Or carefully draw the 36-cell pattern

---

## 🔧 Customization

### Change Grid Size

Edit `NullEffectSplash.tsx`:

```typescript
const COLS = 120;  // Change to 80, 160, etc.
const ROWS = 60;   // Change to 40, 80, etc.
const CELL = 8;    // Change cell pixel size
```

### Change Color Scheme

Replace all instances of `emerald` (green) with another Tailwind color:
- `cyan` for cyan/aqua look
- `blue` for blue terminal
- `amber` for amber/orange
- `rose` for red/pink

Or use custom hex colors in the styles.

### Adjust Seed Density

```typescript
// In seed() function
g[i] = Math.random() < 0.18 ? 1 : 0;
//                     ^^ change this (0.0-1.0)
// 0.18 = 18% alive
// Try 0.10 (sparse), 0.25 (dense), 0.50 (chaos)
```

---

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "framer-motion": "^10.16.4"  // For parallax glow effect
}
```

**Framer Motion** is only used for the parallax mouse tracking glow effect. The Game of Life itself is pure Canvas API with no external dependencies.

---

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

Output goes to `dist/` directory.

### Deploy to Cloud Run
```bash
cd /Users/stephenleonard/git/nulleffect/nulleffect
./scripts/deploy_gcp.sh
```

### Push to GitHub (Auto-Deploy)
```bash
git add .
git commit -m "Add Conway's Game of Life splash page"
git push origin main
```

---

## 🎯 Why Conway's Game of Life?

1. **Mathematical Beauty**: Simple rules create complex patterns
2. **Visual Interest**: Always something new to watch
3. **Interactive**: Users can draw and experiment
4. **Computational Showcase**: Demonstrates real-time processing
5. **Timeless Classic**: Recognized by developers worldwide
6. **Perfect for Terminal**: Fits the retro computing aesthetic

---

## 🐛 Troubleshooting

### Canvas Not Showing
- Check browser console for errors
- Verify TypeScript compiled successfully
- Ensure Tailwind classes are loading

### Slow Performance
- Reduce grid size (COLS × ROWS)
- Increase CELL size
- Disable trail effects (comment out trail rendering)

### Backend Not Connecting
- Check `__API_BASE__` is set correctly
- Verify backend is running
- Check browser network tab for failed requests

---

## 📚 References

- [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)
- [LifeWiki Patterns](https://www.conwaylife.com/wiki/Main_Page)
- [Alien Terminal Aesthetic](https://typesetinthefuture.com/2014/12/01/alien/)
- [Canvas API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

## ✨ Credits

Original concept inspired by:
- **Alien (1979)** - Terminal aesthetic
- **John Conway** - Game of Life (1970)
- **Weyland-Yutani Corp** - Fictional company design language

---

## 🎉 Enjoy!

Watch the patterns emerge. Draw your own. Experiment with speeds. This is computing as art.

**"I can't lie to you about your chances, but... you have my sympathies."**  
— Ash (Alien, 1979)
