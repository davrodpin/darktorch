# 🚨 CORS Issue - Alternative Testing Solution

## Current Status
**Issue**: CORS policy blocking Owlbear Rodeo access to development server
**Server Status**: Vite dev server running but accessibility issues persist

## 🎯 **Immediate Solution: Use Production Build**

Since there are development server connectivity issues, let's use the most reliable approach:

### **Step 1: Build Production Version**
```bash
cd /Users/davpin/dev/github.com/davrodpin/darktorch
npm run build
```

### **Step 2: Serve Production Build**
```bash
# Option A: Use Python built-in server
cd dist
python3 -m http.server 5175

# Option B: Use Node.js server
cd dist
npx serve -p 5175 -s

# Option C: Use PHP server (if available)
cd dist
php -S localhost:5175
```

### **Step 3: Update Manifest for Production**
Create `public/manifest.prod.json`:
```json
{
  "name": "Dark Torch (Test)",
  "description": "Real-time torch timer for Shadowdark RPG",
  "version": "1.0.0-test",
  "author": "davrodpin",
  "homepage": "https://github.com/davrodpin/darktorch",
  "icons": [
    {
      "src": "icon.png",
      "sizes": "128x128",
      "type": "image/png"
    }
  ],
  "action": {
    "title": "Dark Torch (Test)",
    "icon": "icon.png",
    "popover": {
      "url": "http://localhost:5175",
      "width": 320,
      "height": 280
    }
  }
}
```

### **Step 4: Load in Owlbear Rodeo**
1. Open Owlbear Rodeo
2. Settings → Extensions → Add Extension
3. Enter: `http://localhost:5175`
4. Test functionality

## 🧪 Testing Once Loaded

### **Single User Tests**
- [ ] Extension loads without CORS errors
- [ ] Timer displays "60:00" default
- [ ] GM controls work (Start/Pause/Reset/Adjust)
- [ ] Dark theme applied correctly
- [ ] No console errors

### **Multi-User Tests**
1. **Setup Multiple Windows**:
   - Open second browser window (incognito mode)
   - Load same extension URL in both
   - Join same Owlbear Rodeo room

2. **Test Synchronization**:
   - [ ] Leader election works (one shows "Timer Leader")
   - [ ] Other shows "Following" status
   - [ ] Timer syncs between windows instantly
   - [ ] GM controls enforce correctly
   - [ ] Permission system works

### **Advanced Feature Tests**
- [ ] Real-time broadcast messaging works
- [ ] Connection status updates correctly
- [ ] Error boundaries handle issues gracefully
- [ ] State persists across browser refreshes

## 🔧 Alternative: Fix Development Server

If you prefer to fix the dev server instead:

### **Option 1: Simple Vite Config**
Replace `vite.config.ts` with:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true
  }
})
```

### **Option 2: Use Different Port**
```bash
# Stop current server
pkill -f "node.*vite"

# Start on different port
npm run dev -- --port 5176

# Update manifest to use port 5176
```

### **Option 3: Network-Based Access**
```bash
# Get your IP
ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}'

# Update manifest to use your IP: http://YOUR-IP:5174
```

## 📊 Expected Results

Once loaded successfully, you should see:
1. **Timer Interface**: Dark theme, MM:SS display
2. **Status Indicators**: "👑 Timer Leader 🟢 Online" for GM
3. **Control Buttons**: Start/Pause/Reset/Time adjustment (GM only)
4. **Multi-User Sync**: Instant synchronization between all users
5. **Permission System**: GM controls, players view-only

## 🎯 Recommendation

**Start with the Production Build approach** as it's the most reliable and avoids all development server configuration issues. Once you confirm all features work, you can debug the development server later if needed.

The production build will give you a stable testing environment to validate all your Milestone 4 features:
- ✅ Multi-user timer synchronization
- ✅ Leader election with failover
- ✅ GM vs Player permission system
- ✅ Real-time broadcast messaging
- ✅ State persistence across sessions
- ✅ Error handling and recovery