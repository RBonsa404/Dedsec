# Design Backup - Original DEDSEC Theme

This folder contains the original design files for DEDSEC before the Render-inspired redesign.

## Files Backed Up

- `globals.css` - Original dark theme with deep slate & indigo colors
- `components/` - Original UI components with hacker aesthetics

## How to Restore Original Design

If you want to revert to the original design, follow these steps:

1. **Restore the main CSS file:**
   ```bash
   copy backup-design-original\globals.css src\app\globals.css
   ```

2. **Restore the components:**
   ```bash
   xcopy backup-design-original\components src\components /E /I /Y
   ```

3. **Restore the layout files (if needed):**
   - Check `src/app/layout.tsx` - remove `className="dark"` from html tag
   - Check `src/app/(dashboard)/layout.tsx` - restore original background colors

## Design Changes Made

### Color Theme
- **Original:** Dark theme with deep slate (#0b0f19) and emerald/cyan accents
- **New:** Light theme with white background and blue/indigo accents (Render-inspired)

### UI Components
- **Original:** Rounded corners (rounded-xl), glow effects, cyberpunk aesthetics
- **New:** Clean borders, subtle shadows, professional minimalist design

### Typography
- **Original:** Monospace fonts, bold cyberpunk styling
- **New:** Clean sans-serif fonts, professional typography

### Animations
- **Original:** Glow effects, cyberpunk transitions
- **New:** Subtle fade-in animations, smooth transitions

## Design Philosophy

The new design follows Render.com's professional approach:
- Clean, minimalist interface
- High contrast for readability
- Subtle shadows and borders
- Professional color palette
- Smooth animations
- Mobile-responsive design

## Date of Backup
August 16, 2026