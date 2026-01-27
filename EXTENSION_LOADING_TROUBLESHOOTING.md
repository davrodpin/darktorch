# 🚨 Owlbear Rodeo Extension Loading Error - Solutions

## Current Issue
**Error**: "Cannot read PNG file path" when trying to load `http://localhost:5174`
**Status**: Development server appears to be running but not accessible from Owlbear Rodeo

## 🔍 Troubleshooting Steps

### **Option 1: Use Production Build (Most Reliable)**

#### Step 1: Build for Production
```bash
cd /Users/davpin/dev/github.com/davrodpin/darktorch
npm run build
```

#### Step 2: Serve Production Build Locally
```bash
# Install serve if not available
npm install -g serve

# Serve the dist folder
cd dist
serve -p 5175 -s
```

#### Step 3: Update Manifest
1. Copy `public/manifest.json` to backup: `cp public/manifest.json public/manifest.json.backup`
2. Create production manifest:
```json
{
  "name": "Dark Torch",
  "description": "Real-time torch timer for Shadowdark RPG",
  "version": "1.0.0",
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
    "title": "Dark Torch",
    "icon": "icon.png",
    "popover": {
      "url": "http://localhost:5175",
      "width": 320,
      "height": 280
    }
  }
}
```

#### Step 4: Load in Owlbear Rodeo
1. Open Owlbear Rodeo
2. Settings → Extensions → Add Extension
3. Enter: `http://localhost:5175`
4. Test extension functionality

### **Option 2: Fix Development Server Issues**

#### Step 1: Check Server Accessibility
```bash
# Test from command line
curl -I http://localhost:5174

# If fails, try with explicit host
curl -I http://127.0.0.1:5174

# Check if port is actually listening
lsof -ti:5174
```

#### Step 2: Alternative Vite Configuration
```typescript
// Try this configuration in vite.config.ts:
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    cors: {
      origin: "*"
    }
  },
  // ... rest of config
});
```

#### Step 3: Alternative Port
```bash
# Try a different port to avoid conflicts
# Update vite.config.ts to port 5176
# Then use http://localhost:5176 in manifest
```

### **Option 3: Network-Based Testing**

#### Step 1: Use ngrok for External Access
```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 5174

# This will give you a public URL like: https://random-string.ngrok.io
# Use this URL in your manifest
```

#### Step 2: Update Manifest for ngrok
```json
{
  "action": {
    "popover": {
      "url": "https://your-ngrok-url.ngrok.io",
      "width": 320,
      "height": 280
    }
  }
}
```

### **Option 4: Use Owlbear Rodeo's Built-in Dev Tools**

Some versions of Owlbear Rodeo have built-in development tools that can help debug extension loading issues.

#### Step 1: Check Browser Console
1. Open Owlbear Rodeo
2. Open browser developer tools (F12)
3. Look at Console tab
4. Try loading extension
5. Check for specific error messages

#### Step 2: Network Tab Analysis
1. Open Network tab in dev tools
2. Try loading extension
3. Look for failed requests
4. Check response headers and status codes

## 🎯 Recommended Immediate Action

### **Use Option 1 (Production Build) - Most Reliable**
```bash
# Step 1: Build
npm run build

# Step 2: Serve locally  
cd dist && npx serve -p 5175 -s

# Step 3: Update manifest to use port 5175
# Copy the JSON from Option 1 above

# Step 4: Load in Owlbear Rodeo with http://localhost:5175
```

This approach bypasses any Vite development server issues and provides a stable testing environment.

## 📊 Success Indicators

You'll know it's working when:
- [ ] Extension appears in Owlbear Rodeo extensions list
- [ ] No "cannot read PNG file" error
- [ ] Timer interface loads correctly
- [ ] Browser console shows no critical errors
- [ ] All timer controls function as expected

## 🔧 If All Else Fails

### **Debug Information Collection**
1. What browser are you using? (Chrome/Firefox/Safari/Edge)
2. What exact error message appears?
3. Does the error happen immediately or after loading?
4. Can you access `http://localhost:5174` in browser directly?
5. What do you see in browser dev tools console?

### **Last Resort - File Loading**
If web loading fails completely, you can:
1. Load the extension from a local file path
2. Use `file:///Users/davpin/dev/github.com/davrodpin/darktorch/dist/`
3. Note this limits some functionality but allows basic testing

---

**Current Recommendation**: Start with Option 1 (Production Build) as it's the most reliable testing approach!