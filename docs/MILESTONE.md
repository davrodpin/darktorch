# Dark Torch - Project Milestones

This document outlines the implementation roadmap for the Dark Torch Owlbear Rodeo extension, breaking down the project into manageable milestones and tasks.

## Milestone 1: Project Bootstrap and Foundation Setup
**Goal**: Establish the basic project structure and development environment.

### Tasks
- [ ] Initialize Vite + React + TypeScript project
- [ ] Install core dependencies (@owlbear-rodeo/sdk, @mui/material, zustand)
- [ ] Configure Vite with CORS settings for Owlbear Rodeo development
- [ ] Set up TypeScript configuration
- [ ] Create basic project folder structure
- [ ] Set up ESLint and Prettier for code quality
- [ ] Create initial Git repository and .gitignore
- [ ] Generate basic extension icon (128x128 PNG)
- [ ] Create initial manifest.json with basic configuration

**Deliverables**: Working development environment, basic project structure, installable extension skeleton

---

## Milestone 2: Core Architecture and Basic UI
**Goal**: Implement the fundamental React components and state management.

### Tasks
- [ ] Create TypeScript type definitions for timer state
- [ ] Set up Zustand store for timer state management
- [ ] Create basic Material-UI theme with dark colors
- [ ] Implement TimerDisplay component (shows MM:SS format)
- [ ] Implement TimerControls component (basic start/pause/reset)
- [ ] Create App.tsx main component layout
- [ ] Set up basic extension popup UI
- [ ] Test extension loading in Owlbear Rodeo

**Deliverables**: Functional timer UI with basic controls, state management working

---

## Milestone 3: Core Timer Functionality
**Goal**: Implement the real-time countdown timer logic.

### Tasks
- [ ] Create useTimer custom hook for countdown logic
- [ ] Implement real-time countdown using setInterval
- [ ] Add timer pause/resume functionality
- [ ] Add timer reset functionality
- [ ] Implement time adjustment (+/- minutes)
- [ ] Handle timer completion (reaches 00:00)
- [ ] Add sound/notification options for timer expiry
- [ ] Create time utility functions (format MM:SS, etc.)

**Deliverables**: Fully functional countdown timer with all basic controls

---

## Milestone 4: Owlbear Rodeo Integration
**Goal**: Integrate with Owlbear Rodeo SDK for real-time sync and permissions.

### Tasks
- [ ] Initialize Owlbear Rodeo SDK connection
- [ ] Implement role detection (GM vs player)
- [ ] Create context menu items for timer controls
- [ ] Set up real-time sync using OBR.broadcast
- [ ] Implement permission-based UI visibility
- [ ] Add timer state persistence across sessions
- [ ] Handle multiple users accessing same timer
- [ ] Test multi-user synchronization

**Deliverables**: Timer synchronized across all users, proper role permissions

---

## Milestone 5: Display Modes and Visual Features
**Goal**: Implement different display options and visual enhancements.

### Tasks
- [ ] Implement hourglass display mode (visual representation)
- [ ] Add display mode toggle (number vs hourglass)
- [ ] Create smooth animations for timer transitions
- [ ] Implement visibility modes (GM only vs everyone)
- [ ] Add visual indicators for timer state (running/paused)
- [ ] Implement low time warnings (visual indicators)
- [ ] Add customizable timer colors/themes
- [ ] Create responsive design for different popup sizes

**Deliverables**: Multiple display modes, enhanced visual feedback

---

## Milestone 6: Settings and Configuration
**Goal**: Implement comprehensive settings panel and configuration options.

### Tasks
- [ ] Create SettingsPanel component
- [ ] Implement default timer duration setting
- [ ] Add player permission management
- [ ] Create sound settings configuration
- [ ] Implement display mode persistence
- [ ] Add timer auto-start options
- [ ] Create settings validation and error handling
- [ ] Add settings reset to defaults option

**Deliverables**: Complete settings interface with all configuration options

---

## Milestone 7: Shadowdark Theme and Polish
**Goal**: Apply Shadowdark-inspired theming and finalize visual design.

### Tasks
- [ ] Research Shadowdark core book visual style
- [ ] Design custom Material-UI theme with Shadowdark colors
- [ ] Create parchment-style background elements
- [ ] Implement gothic/mystical typography
- [ ] Add Shadowdark-inspired icons and graphics
- [ ] Create hover effects and micro-interactions
- [ ] Ensure accessibility compliance (contrast, screen readers)
- [ ] Polish all UI components for consistency

**Deliverables**: Professional Shadowdark-themed interface

---

## Milestone 8: Testing and Quality Assurance
**Goal**: Comprehensive testing and bug fixing.

### Tasks
- [ ] Write unit tests for timer logic and state management
- [ ] Test timer accuracy over extended periods
- [ ] Test multi-user synchronization scenarios
- [ ] Verify permission system works correctly
- [ ] Test extension installation and loading
- [ ] Perform cross-browser compatibility testing
- [ ] Test edge cases (invalid inputs, network issues)
- [ ] Conduct user acceptance testing with sample users

**Deliverables**: Thoroughly tested, stable extension

---

## Milestone 9: Documentation and Deployment Preparation
**Goal**: Complete documentation and prepare for release.

### Tasks
- [ ] Write comprehensive README.md with installation guide
- [ ] Create user manual with screenshots
- [ ] Document all configuration options
- [ ] Prepare extension store listing materials
- [ ] Set up production build configuration
- [ ] Create deployment scripts/CI configuration
- [ ] Set up versioning and release process
- [ ] Prepare support documentation and contact info

**Deliverables**: Complete documentation, deployment-ready build

---

## Milestone 10: Release and Post-Launch
**Goal**: Deploy extension and establish ongoing maintenance.

### Tasks
- [ ] Deploy to chosen hosting platform (Render/Vercel)
- [ ] Submit to Owlbear Rodeo extension store
- [ ] Set up analytics and error tracking
- [ ] Create issue templates for bug reports
- [ ] Establish support channels (Discord, GitHub Issues)
- [ ] Monitor initial user feedback and bugs
- [ ] Plan for future features and improvements
- [ ] Create maintenance and update schedule

**Deliverables**: Published extension, ongoing support infrastructure

---

## Implementation Guidelines

### Task Dependencies
- Milestone 1 must be completed before any other milestone
- Milestone 2 should be completed before Milestone 3
- Milestone 4 requires completion of Milestones 2-3
- Milestone 5 requires completion of Milestone 4
- Milestones 6-7 can be worked on in parallel after Milestone 4
- Milestone 8 requires completion of all previous milestones
- Milestone 9 requires completion of Milestone 8
- Milestone 10 requires completion of Milestone 9

### Time Estimates
- **Milestone 1**: 2-3 hours
- **Milestone 2**: 3-4 hours  
- **Milestone 3**: 4-5 hours
- **Milestone 4**: 5-6 hours
- **Milestone 5**: 4-5 hours
- **Milestone 6**: 3-4 hours
- **Milestone 7**: 3-4 hours
- **Milestone 8**: 4-6 hours
- **Milestone 9**: 2-3 hours
- **Milestone 10**: 2-3 hours

**Total Estimated Time**: 32-43 hours

### Success Criteria
Each milestone should be considered complete when:
1. All tasks in the milestone are finished
2. The feature works as described in original AGENT.md
3. Code follows to established conventions and is well-documented
4. Testing confirms the implementation is stable
5. The milestone deliverables are ready for the next phase

### Risk Mitigation
- **Technical Complexity**: Start with simpler implementations and iterate
- **Owlbear Rodeo API Changes**: Keep SDK updated, monitor for breaking changes
- **Time Management**: Focus on core features first, nice-to-haves later
- **User Experience**: Regular testing with actual Owlbear Rodeo users

---

*This milestone document should be updated as the project evolves and new requirements are discovered.*