# Learning Interface - Complete Test Guide

## 🎨 Layout Overview

```
┌─────────────────────────────────────────────────────────┐
│  [☰ Hide Sidebar]              Welcome, User Name       │
├──────────────┬──────────────────────────────────────────┤
│              │                                           │
│  SIDEBAR     │         VIDEO PLAYER                      │
│              │                                           │
│  Sections    │      [YouTube Iframe]                     │
│  └─ Videos   │                                           │
│     🔒 Locked│                                           │
│     ▶ Active │                                           │
│     ✓ Done   │                                           │
│              │                                           │
├──────────────┴──────────────────────────────────────────┤
│  METADATA                                                │
│  Video Title                                             │
│  Section Name                                            │
│  ✓ Completed | Duration: 10 min                         │
└──────────────────────────────────────────────────────────┘
```

---

## 📋 Components

### 1. Sidebar (Left - 320px)

**Features:**
- ✅ Subject title
- ✅ Back to subject button
- ✅ Collapsible (hide/show)
- ✅ Sections grouped
- ✅ Videos listed
- ✅ Lock icons (🔒)
- ✅ Play icons (▶)
- ✅ Completion checks (✓)
- ✅ Progress bars
- ✅ Current video highlighted
- ✅ Click to navigate
- ✅ Scrollable

**Video States:**
```
🔒 Locked    - Gray background, not clickable
▶ Unlocked   - White background, clickable
✓ Completed  - Green check, clickable
🔵 Current   - Blue highlight
```

---

### 2. Video Player (Center)

**Features:**
- ✅ YouTube iframe
- ✅ Auto-play
- ✅ Resume from last position
- ✅ Full-screen capable
- ✅ Progress tracking (every 5s)
- ✅ Auto-complete at 95%
- ✅ Auto-next on completion
- ✅ Responsive sizing

**Controls:**
- Play/Pause
- Volume
- Fullscreen
- Quality settings
- Playback speed

---

### 3. Metadata (Bottom)

**Features:**
- ✅ Video title
- ✅ Section name
- ✅ Completion badge
- ✅ Duration display
- ✅ Clean layout

---

### 4. Header (Top)

**Features:**
- ✅ Toggle sidebar button
- ✅ User name display
- ✅ Responsive

---

## 🧪 Test Cases

### Test 1: Sidebar Loads Subject Tree

**Steps:**
1. Login to application
2. Navigate to subjects page
3. Click on a subject
4. Click on first video
5. Observe sidebar

**Expected Results:**
- ✅ Sidebar visible on left
- ✅ Subject title displayed
- ✅ All sections listed
- ✅ All videos listed under sections
- ✅ First video has ▶ icon (unlocked)
- ✅ Other videos have 🔒 icon (locked)
- ✅ Current video highlighted in blue
- ✅ Sidebar is scrollable

**SQL Verification:**
```sql
-- Check subject tree loaded
SELECT 
  sub.title as subject,
  sec.title as section,
  v.title as video,
  v.display_order
FROM subjects sub
JOIN sections sec ON sub.id = sec.subject_id
JOIN videos v ON sec.id = v.section_id
WHERE sub.id = 1
ORDER BY sec.display_order, v.display_order;
```

**Screenshot Checklist:**
- [ ] Sidebar shows subject name
- [ ] Sections are grouped
- [ ] Videos show correct icons
- [ ] Current video highlighted
- [ ] Locked videos grayed out

---

### Test 2: Video Plays

**Steps:**
1. On video player page
2. Wait for YouTube player to load
3. Video should auto-play

**Expected Results:**
- ✅ YouTube iframe loads
- ✅ Video starts playing automatically
- ✅ Video resumes from last watched position
- ✅ Player controls work (play/pause/volume)
- ✅ Fullscreen works
- ✅ No errors in console

**Technical Checks:**
```javascript
// Check YouTube API loaded
console.log(window.YT); // Should be defined

// Check player initialized
console.log(playerRef.current); // Should be YouTube player object

// Check video playing
playerRef.current.getPlayerState(); // Should return 1 (playing)
```

**Resume Position Test:**
```sql
-- Set progress to 2 minutes
INSERT INTO video_progress (user_id, video_id, watched_duration, completed)
VALUES (1, 1, 120, 0);

-- Reload page
-- Video should start at 2:00 mark
```

---

### Test 3: Progress Saved

**Steps:**
1. Start watching video
2. Wait 5 seconds
3. Check database
4. Continue watching
5. Check database again

**Expected Results:**
- ✅ Progress saved every 5 seconds
- ✅ `watched_duration` updates in database
- ✅ `last_watched` timestamp updates
- ✅ No duplicate records (upsert works)
- ✅ Progress bar in sidebar updates

**SQL Verification:**
```sql
-- Check progress saved
SELECT 
  user_id,
  video_id,
  watched_duration,
  completed,
  last_watched
FROM video_progress
WHERE user_id = 1 AND video_id = 1;

-- Should show increasing watched_duration
```

**Console Check:**
```javascript
// Watch Network tab (F12)
// Every 5 seconds should see:
POST /progress/1
{
  "watchedDuration": 125,
  "completed": false
}
```

**Visual Check:**
- [ ] Progress bar appears in sidebar
- [ ] Progress bar fills as video plays
- [ ] Percentage increases

---

### Test 4: Auto Next Works

**Steps:**
1. Watch video to 95% completion
2. Wait for auto-complete
3. Observe confirmation dialog
4. Click "OK" to play next

**Expected Results:**
- ✅ Video marked complete at 95%
- ✅ Confirmation dialog appears
- ✅ Dialog shows next video title
- ✅ Clicking OK navigates to next video
- ✅ Next video starts playing
- ✅ Sidebar updates (✓ on completed, ▶ on next)
- ✅ Previous video shows green check
- ✅ Next video unlocked

**SQL Verification:**
```sql
-- After completion
SELECT 
  v.id,
  v.title,
  vp.completed,
  vp.watched_duration
FROM videos v
LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = 1
WHERE v.id IN (1, 2)
ORDER BY v.id;

-- Video 1: completed = 1
-- Video 2: should be accessible
```

**Sidebar Check:**
- [ ] Completed video shows ✓
- [ ] Next video shows ▶ (unlocked)
- [ ] Next video clickable
- [ ] Progress bar removed from completed

---

## 🎯 Complete User Flow Test

### Scenario: New User Watches First 3 Videos

**Step 1: Start**
```
Login → Subjects → Click Subject → Click First Video
```

**Expected:**
- Sidebar shows all videos
- First video: ▶ (unlocked)
- Others: 🔒 (locked)
- Video plays automatically

**Step 2: Watch Video 1**
```
Watch for 30 seconds → Check sidebar
```

**Expected:**
- Progress bar appears under Video 1
- Progress saves every 5 seconds
- Other videos still locked

**Step 3: Complete Video 1**
```
Watch to 95% → Confirm auto-next
```

**Expected:**
- Video 1: ✓ (completed)
- Video 2: ▶ (unlocked)
- Navigate to Video 2
- Video 2 starts playing

**Step 4: Watch Video 2**
```
Watch Video 2 → Complete → Auto-next
```

**Expected:**
- Video 2: ✓ (completed)
- Video 3: ▶ (unlocked)
- Navigate to Video 3

**Step 5: Partial Watch Video 3**
```
Watch 50% → Close browser
```

**Expected:**
- Progress saved
- Video 3 shows progress bar

**Step 6: Return Later**
```
Login → Navigate to Video 3
```

**Expected:**
- Video resumes at 50% mark
- Progress bar shows 50%
- Can continue watching

---

## 🔧 Interactive Features Test

### Sidebar Toggle
```
Click "Hide Sidebar" → Sidebar collapses
Click "Show Sidebar" → Sidebar expands
```

### Video Navigation
```
Click locked video → Alert: "Complete previous videos"
Click unlocked video → Navigate to that video
Click completed video → Navigate to that video
```

### Progress Bar
```
Hover over progress bar → Shows percentage
Progress updates in real-time
Completed videos → No progress bar
```

---

## 📊 Performance Checks

### Load Time
- [ ] Page loads in < 2 seconds
- [ ] YouTube player loads in < 3 seconds
- [ ] Sidebar renders immediately
- [ ] No layout shift

### Responsiveness
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Sidebar collapses on mobile

### Memory
- [ ] No memory leaks
- [ ] Progress interval clears on unmount
- [ ] YouTube player destroys properly

---

## ✅ Verification Checklist

### Layout
- [ ] Sidebar on left (320px)
- [ ] Video player in center
- [ ] Metadata at bottom
- [ ] Header at top
- [ ] Responsive design

### Sidebar
- [ ] Subject title shows
- [ ] Sections grouped
- [ ] Videos listed
- [ ] Lock icons correct
- [ ] Completion checks show
- [ ] Progress bars display
- [ ] Current video highlighted
- [ ] Clickable navigation
- [ ] Scrollable content
- [ ] Toggle works

### Video Player
- [ ] YouTube iframe loads
- [ ] Auto-play works
- [ ] Resume position works
- [ ] Controls functional
- [ ] Fullscreen works
- [ ] Quality settings work

### Progress Tracking
- [ ] Saves every 5 seconds
- [ ] Updates database
- [ ] Shows in sidebar
- [ ] Persists across sessions
- [ ] Auto-completes at 95%

### Auto Next
- [ ] Detects completion
- [ ] Shows confirmation
- [ ] Navigates to next
- [ ] Updates sidebar
- [ ] Unlocks next video

### Metadata
- [ ] Video title shows
- [ ] Section name shows
- [ ] Completion badge shows
- [ ] Duration displays

---

## 🐛 Common Issues & Fixes

### Sidebar Not Loading
```javascript
// Check API call
console.log(await apiClient.get('/subjects/1/tree'));
// Should return subject with sections and videos
```

### Video Not Playing
```javascript
// Check YouTube API
console.log(window.YT);
// Check video ID
console.log(videoData.youtube_id);
```

### Progress Not Saving
```javascript
// Check interval running
console.log(progressIntervalRef.current);
// Check API call
// Network tab should show POST /progress/:id every 5s
```

### Auto Next Not Working
```javascript
// Check completion detection
console.log(currentTime >= duration - 5);
// Check next video API
console.log(await apiClient.get('/videos/1/next'));
```

---

## 🎬 Demo Script

**For testing/demo purposes:**

1. **Login** as test user
2. **Navigate** to JavaScript Fundamentals
3. **Click** first video
4. **Show** sidebar with all videos
5. **Point out** locked videos
6. **Watch** video for 30 seconds
7. **Show** progress saving
8. **Skip** to 95%
9. **Show** auto-complete
10. **Accept** auto-next
11. **Show** next video unlocked
12. **Show** previous video completed
13. **Toggle** sidebar
14. **Click** different video
15. **Show** navigation working

---

**Your learning interface is complete with sidebar, player, and metadata!** 🎓✅

Test it now: Login → Subject → Video → Watch the magic happen! 🚀
