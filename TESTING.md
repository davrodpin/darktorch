# Testing Guide for Dark Torch Owlbear Rodeo Extension

## 🚀 Quick Start

### 1. Development Server Status
✅ **Status**: Running on `http://localhost:5174`
✅ **Vite Config**: CORS enabled for Owlbear Rodeo
✅ **Build**: Successful (55KB main bundle)
✅ **Manifest**: Development version ready

### 2. Load Extension in Owlbear Rodeo

#### Option A: Development Mode (Recommended)
1. Open Owlbear Rodeo
2. Go to Settings → Extensions
3. Click "Add Extension"
4. Enter URL: `http://localhost:5174`
5. Extension loads with live reload support

#### Option B: Production Build
1. Copy `manifest.dev.json` to `manifest.json` (backup original first)
2. Load extension using local file path

## 🧪 Testing Scenarios

### Phase 1: Basic Functionality
```
□ Timer display shows correctly
□ Start/Pause buttons work (GM only)
□ Reset button functions (GM only)
□ Time adjustment controls work (GM only)
□ Sound notifications trigger properly
□ Visual status indicators show correct roles
```

### Phase 2: Multi-User Synchronization
```
□ Leader election works on load
□ Timer syncs between users
□ Permission restrictions enforced
□ Connection status updates correctly
□ State persists across refreshes
□ Error boundaries handle issues gracefully
```

### Phase 3: Advanced Features
```
□ Context menu integration works
□ State backup/restore functions
□ Multiple concurrent users handled
□ Network interruption recovery
□ Conflict resolution operates correctly
```

## 📋 Test Checklist

### Single User (GM Account)
- [ ] Extension loads without errors
- [ ] Timer displays 60:00 (default)
- [ ] Can start timer (becomes leader)
- [ ] Can pause timer
- [ ] Can reset timer
- [ ] Can adjust time (+/-)
- [ ] Sound plays on timer completion
- [ ] Status shows "👑 Timer Leader 🟢 Online"

### Multiple Users (GM + Player)
- [ ] GM sees full controls
- [ ] Player sees read-only timer
- [ ] Leader election assigns GM as leader
- [ ] Timer changes sync instantly
- [ ] Player cannot control timer
- [ ] Both see connection status

### Network Tests
- [ ] Disconnect/reconnect works
- [ ] Leader re-election occurs
- [ ] Queued messages deliver on reconnect
- [ ] State persistence survives refresh

### Error Scenarios
- [ ] Extension handles OBR unavailability
- [ ] Invalid permissions handled gracefully
- [ ] Network errors show user-friendly messages
- [ ] Extension recovers from crashes

## 🔧 Development Tools

### Browser Console
```javascript
// Monitor timer events
OBR.broadcast.onMessage('com.github.davrodpin.darktorch/*', (event) => {
  console.log('Timer event:', event);
});

// Check connection status
console.log('Connection status:', timerSyncService.getConnectionStatus());

// Force election (debug)
leaderElectionService.triggerElection();
```

### Network Tab
- Look for WebSocket connections
- Monitor broadcast messages
- Check for failed requests

### Extension Debugging
```javascript
// Access internal services (dev mode only)
window.timerSyncService = timerSyncService;
window.leaderElectionService = leaderElectionService;
window.statePersistenceService = statePersistenceService;
```

## 📱 Testing Setup

### Multiple Browser Windows
1. Open 2 browser windows
2. Use different profiles or incognito mode
3. Load extension in both
4. Join same Owlbear Rodeo room
5. Test synchronization

### Multiple Devices
1. Ensure devices on same network
2. Access `http://[your-ip]:5174` from other devices
3. Load extension in each device's OBR
4. Test cross-device synchronization

## 🐛 Common Issues & Solutions

### CORS Errors
**Issue**: "Blocked by CORS policy"
**Solution**: Vite config already handles this, ensure dev server running

### Connection Refused
**Issue**: Cannot connect to localhost:5174
**Solution**: Check if dev server is running, verify port

### Permission Denied
**Issue**: Player can control timer
**Solution**: Check role detection in OBR settings

### Sync Not Working
**Issue**: Timer changes don't sync
**Solution**: Check network tab for broadcast errors

## 📊 Performance Monitoring

### Bundle Size Analysis
- **Main Bundle**: 55.51 KB (gzipped: 12.55 KB)
- **CSS Bundle**: 0.91 KB (gzipped: 0.49 KB)
- **Total**: ~57KB (well within limits)

### Memory Usage
- Monitor tab memory usage
- Check for memory leaks in hooks
- Verify cleanup on unmount

## ✅ Success Criteria

Extension is ready when:
- [ ] All basic timer functions work
- [ ] Multi-user sync operates correctly
- [ ] Permission system enforced
- [ ] Error handling graceful
- [ ] Performance acceptable
- [ ] No console errors in production build

---

## 🚨 Next Steps After Testing

1. **Collect Feedback**: Note any issues or improvements
2. **Fix Bugs**: Address any problems found
3. **Optimize**: Improve performance based on metrics
4. **Prepare for Milestone 5**: Display modes and visual features

**Current Status**: Ready for multi-user testing in Owlbear Rodeo!