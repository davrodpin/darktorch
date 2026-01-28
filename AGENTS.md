# Dark Torch

Extension for the Virtual Table Top platform
[Owlbear Rodeo](https://www.owlbear.rodeo/) to be used in
[Shadowdark](https://www.thearcanelibrary.com/collections/shadowdark-rpg/products/shadowdark-rpg)
RPG adventures.

Enable the game mechanic for torches that burns for one hour of real time.

## Features

- Real time counter (default to one hour, can be changed)
- Timer can be paused and resumed at any time
- Timer can be changed at any time (e.g. account for time passing in game that
  should affect the torch timer)
- Visibility modes: only GM or everyone can see the timer
- Display modes: number or hourglass
- By default only GM can start, stop, resume, reset or change the torch timer
  but there is an option to allow players to manage the torch
- Look and feel inspired by Shadowdark art, format and tables from the core book

## Tech Stack

### Core Framework

- **React (currently 19.x)** with TypeScript
- **Vite** for build tooling and development server
- **@owlbear-rodeo/sdk** for Owlbear Rodeo integration

### UI Components & Styling

- **Material-UI (@mui/material)** - Consistent with official examples
- **@emotion/react** & **@emotion/styled** for styling
- **@fontsource/** fonts for typography

### State Management

- **Zustand** - Lightweight, simple state management
- React hooks for local component state

### Development Tools

- **TypeScript** for type safety
- **ESLint** + **Prettier** for code quality
- **Vite** with CORS configuration for development and Owlbear embedding

## Project Structure

```
darktorch/
├── public/
│   ├── manifest.json               # Owlbear Rodeo extension manifest
│   ├── icon.png                    # Extension icon (PNG)
│   └── icon.svg                    # Extension icon (SVG)
├── src/
│   ├── components/            # React components
│   │   ├── TimerDisplay.tsx
│   │   ├── TimerControls.tsx
│   │   ├── HourglassDisplay.tsx
│   │   ├── PermissionWrapper.tsx
│   │   ├── TimerErrorBoundary.tsx
│   │   └── TwoIconToggleGroup.tsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useOwlbearSDK.ts
│   │   ├── useTimer.ts
│   │   ├── useTimerSync.ts
│   │   ├── useLeaderElection.ts
│   │   └── usePlayerRole.ts
│   ├── services/              # Owlbear + sync services
│   │   ├── contextMenu.ts
│   │   ├── timerSync.ts
│   │   ├── leaderElection.ts
│   │   └── statePersistence.ts
│   ├── store/                 # Zustand store
│   │   └── timerStore.ts
│   ├── theme/                 # MUI theme
│   │   └── shadowdarkTheme.ts
│   ├── types/                 # TypeScript definitions
│   │   └── index.ts
│   ├── utils/                 # Helper functions
│   │   └── timeUtils.ts
│   ├── test/                  # Test helpers + mocks
│   ├── App.tsx                # Main application component
│   ├── main.tsx               # Application entry point
│   ├── index.css              # Global styles
│   └── App.css                # App styles
├── index.html                # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## Development Setup

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Initial Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Development server:
   ```bash
   npm run dev
   ```

3. Vite config notes (CORS + host for Owlbear embedding):
   ```typescript
   // vite.config.ts
   import react from "@vitejs/plugin-react";
   import path from "path";
   import { defineConfig } from "vite";

   export default defineConfig({
     plugins: [react()],
     server: {
       host: true,
       port: 5174,
       cors: {
         origin: "*",
         methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allowedHeaders: ["Content-Type", "Authorization"],
         credentials: true,
       },
     },
     resolve: {
       alias: {
         "@": path.resolve(__dirname, "./src"),
         "@/components": path.resolve(__dirname, "./src/components"),
         "@/hooks": path.resolve(__dirname, "./src/hooks"),
         "@/store": path.resolve(__dirname, "./src/store"),
         "@/types": path.resolve(__dirname, "./src/types"),
         "@/utils": path.resolve(__dirname, "./src/utils"),
       },
     },
   });
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
- Persist state in a shared store (and optionally across sessions if enabled via
  persistence services)

#### Owlbear Rodeo Integration

- Initialize via `OBR.onReady(...)` and guard on `OBR.isAvailable` for
  non-embedded/dev mode
- Use `OBR.contextMenu.create(...)` for timer-related context menu actions
- Use `OBR.broadcast.sendMessage(event, payload)` +
  `OBR.broadcast.onMessage(event, handler)` for real-time sync
- Handle role-based permissions via player role checks (GM / leader election,
  depending on feature)

#### Shadowdark Theme

- Material-UI custom theme inspired by Shadowdark core book
- Dark color palette with parchment accents
- Gothic/mystical typography where appropriate

### Key Components

#### TimerDisplay Component

- Shows remaining time in MM:SS format
- Supports both numeric and hourglass display modes
- Visibility/display mode is controlled via store + permissions

#### TimerControls Component

- Start/Pause/Reset controls
- Time adjustment inputs (+/- minutes)
- Permission-based rendering (GM only vs players)

#### Supporting Components

- `PermissionWrapper`: centralizes permission-gated UI
- `TimerErrorBoundary`: prevents UI crashes and can report/broadcast errors
- `HourglassDisplay`: alternate visualization for the timer
- `TwoIconToggleGroup`: small UI primitive used by settings/controls

## Extension Manifest

`public/manifest.json`:

```json
{
  "name": "Dark Torch",
  "description": "Real-time torch timer for Shadowdark RPG",
  "version": "1.0.0",
  "manifest_version": 1,
  "action": {
    "title": "Dark Torch",
    "icon": "/icon.png",
    "popover": "/",
    "width": 320,
    "height": 440
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
