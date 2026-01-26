# Dark Torch

Extension for the Virtual Table Top plarform [Owlbear Rodeo](https://www.owlbear.rodeo/) to be used in [Shadowdark](https://www.thearcanelibrary.com/collections/shadowdark-rpg/products/shadowdark-rpg) RPG adventures.

Enable the game mechanic for torches that burns for one hour of real time.

## Features

- Real time counter (default to one hour, can be changed)
- Timer can be paused and resume at any time
- Timer can be changed at any time (e.g. account for time passing in game that should affect the torch timer)
- Visibility modes: only GM or everyone can see the timer
- Display modes: number or hourglass
- By default only GM can start, stop, resume, reset or change the torch timer but there is an option to allow players to manage the torch
- Look and feel inspired by Shadowdark art, format and tables from the core book

## Tech Stack

### Core Framework
- **React 18+** with TypeScript
- **Vite** for build tooling and development server
- **@owlbear-rodeo/sdk** for Owlbear Rodeo integration

### UI Components & Styling
- **Material-UI (@mui/material)** - Consistent with official examples
- **@emotion/react** & **@emotion/styled** for styling
- **Tailwind CSS** (optional, for rapid styling)

### State Management
- **Zustand** - Lightweight, simple state management
- React hooks for local component state

### Development Tools
- **TypeScript** for type safety
- **ESLint** + **Prettier** for code quality
- **Vite** with CORS configuration for development

## Project Structure

```
darktorch/
├── public/
│   ├── manifest.json          # Owlbear Rodeo extension manifest
│   └── icon.png               # Extension icon
├── src/
│   ├── components/            # React components
│   │   ├── TimerDisplay.tsx
│   │   ├── TimerControls.tsx
│   │   └── SettingsPanel.tsx
│   ├── hooks/                 # Custom React hooks
│   │   └── useTimer.ts
│   ├── store/                 # Zustand store
│   │   └── timerStore.ts
│   ├── types/                 # TypeScript definitions
│   │   └── index.ts
│   ├── utils/                 # Helper functions
│   │   └── timeUtils.ts
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── vite-env.d.ts         # Vite type definitions
├── index.html                # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js (optional)
```

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Initial Setup
1. Create new Vite + React + TypeScript project:
   ```bash
   npm create vite@latest darktorch -- --template react-ts
   cd darktorch
   npm install
   ```

2. Install Owlbear Rodeo SDK and dependencies:
   ```bash
   npm install @owlbear-rodeo/sdk @mui/material @emotion/react @emotion/styled zustand
   npm install -D @types/node
   ```

3. Configure Vite for CORS (required for Owlbear Rodeo):
   ```typescript
   // vite.config.ts
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     server: {
       cors: true,
       host: true
     }
   })
   ```

### Development
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```

## Implementation Details

### Core Features Architecture

#### Timer State Management
- Use Zustand for global timer state
- Store: countdown duration, isRunning, isVisible, displayMode
- Persist state across component re-renders

#### Owlbear Rodeo Integration
- Use `OBR.contextmenu.create()` for timer controls
- Implement `OBR.broadcast.sendMessage()` for real-time sync
- Handle role-based permissions with `OBR.player.isGM`

#### Shadowdark Theme
- Material-UI custom theme inspired by Shadowdark core book
- Dark color palette with parchment accents
- Gothic/mystical typography where appropriate

### Key Components

#### TimerDisplay Component
- Shows remaining time in MM:SS format
- Supports both numeric and hourglass display modes
- GM-only visibility toggle

#### TimerControls Component  
- Start/Pause/Reset controls
- Time adjustment inputs (+/- minutes)
- Permission-based rendering (GM only vs players)

#### SettingsPanel Component
- Default timer duration configuration
- Display mode selection (number/hourglass)
- Permission management (who can control timer)

## Extension Manifest

Create `public/manifest.json`:

```json
{
  "name": "Dark Torch",
  "description": "Real-time torch timer for Shadowdark RPG",
  "version": "1.0.0",
  "author": "Your Name",
  "homepage": "https://your-repo-url",
  "icons": [
    {
      "src": "icon.png",
      "sizes": "128x128",
      "type": "image/png"
    }
  ],
  "action": {
    "title": "Dark Torch",
    "icon": "icon.png",
    "popover": {
      "url": "index.html",
      "width": 320,
      "height": 240
    }
  }
}
```

## Deployment

### Recommended Hosting Platforms
- **Render** - Free tier available, used in official docs
- **Vercel** - Excellent for React apps
- **Netlify** - Simple static site hosting
- **GitHub Pages** - Free for public repositories

### Build Process
1. Run `npm run build`
2. Deploy `dist` folder to chosen platform
3. Ensure `manifest.json` is accessible at root URL
4. Test installation via Owlbear Rodeo extension menu

## Project Milestones

For detailed implementation roadmap and task breakdown, see [docs/MILESTONE.md](./docs/MILESTONE.md).

The project is organized into 10 major milestones covering everything from initial setup to deployment and ongoing maintenance. Each milestone includes specific tasks, deliverables, and dependencies to ensure systematic development progress.

