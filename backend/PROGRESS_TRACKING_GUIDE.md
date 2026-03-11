# Video Progress Tracking - Complete Guide

## 📡 API Endpoints

### 1. POST /progress/:videoId

Update video watch progress (upsert - insert or update).

**Authentication:** Required

**Request Body:**
```json
{
  "watchedDuration": 120,
  "completed": false
}
```

**Response:**
```json
{
  "message": "Progress updated successfully",
  "progress": {
    "watched_duration": 120,
    "completed": false,
    "percentage": 20
  }
}
```

**Features:**
- ✅ **Upsert**: Creates new or updates existing progress
- ✅ **Duration Capping**: Caps `watchedDuration` to video duration
- ✅ **Auto-Complete**: Marks complete if watched ≥ 95%
- ✅ **Timestamp**: Updates `last_watched` on every save

---

### 2. GET /progress/:videoId

Get progress for specific video.

**Authentication:** Required

**Response:**
```json
{
  "progress": {
    "id": 1,
    "user_id": 1,
    "video_id": 1,
    "watched_duration": 120,
    "completed": 0,
    "last_watched": "2024-01-15T10:30:00.000Z",
    "total_duration": 600,
    "video_title": "What is JavaScript?"
  }
}
```

**No Progress:**
```json
{
  "progress": null
}
```

---

### 3. GET /progress

Get user's overall progress across all subjects.

**Authentication:** Required

**Response:**
```json
{
  "progress": [
    {
      "subject_id": 1,
      "subject_title": "JavaScript Fundamentals",
      "total_videos": 9,
      "completed_videos": 3,
      "progress_percentage": 33.33
    },
    {
      "subject_id": 2,
      "subject_title": "React.js Mastery",
      "total_videos": 9,
      "completed_videos": 0,
      "progress_percentage": 0
    }
  ]
}
```

---

## ⚙️ Features Explained

### 1. Resume Video

**How it works:**
1. User starts watching video
2. Progress saved every 5 seconds
3. User closes browser
4. Returns later → video resumes from `watched_duration`

**Implementation:**
```javascript
// Frontend: Get progress on load
const { data } = await apiClient.get(`/progress/${videoId}`);
const resumePosition = data.progress?.watched_duration || 0;

// Start video at resume position
player.seekTo(resumePosition);
```

---

### 2. Mark Completed

**Auto-Complete:**
- Video marked complete when watched ≥ 95%
- Prevents need to watch credits/outro

**Manual Complete:**
```json
POST /progress/:videoId
{
  "watchedDuration": 600,
  "completed": true
}
```

**Check:**
```sql
SELECT completed FROM video_progress 
WHERE user_id = ? AND video_id = ?;
```

---

### 3. Upsert Progress

**First Save (INSERT):**
```sql
INSERT INTO video_progress (user_id, video_id, watched_duration, completed)
VALUES (1, 1, 120, 0);
```

**Subsequent Saves (UPDATE):**
```sql
UPDATE video_progress 
SET watched_duration = 240, 
    completed = 0, 
    last_watched = NOW()
WHERE user_id = 1 AND video_id = 1;
```

**Logic:**
```javascript
// Check if exists
const exists = await checkProgressExists(userId, videoId);

if (exists) {
  await updateProgress(userId, videoId, duration, completed);
} else {
  await insertProgress(userId, videoId, duration, completed);
}
```

---

### 4. Cap Position ≤ Duration

**Problem:** User might send `watchedDuration > video.duration`

**Solution:**
```javascript
const videoDuration = 600; // 10 minutes
const watchedDuration = 700; // User sent 11 minutes (invalid)

// Cap to video duration
const cappedDuration = Math.min(watchedDuration, videoDuration);
// Result: 600
```

**SQL:**
```sql
-- Get video duration
SELECT duration FROM videos WHERE id = ?;

-- Cap in application code
cappedDuration = MIN(watchedDuration, videoDuration);

-- Save capped value
UPDATE video_progress SET watched_duration = cappedDuration ...
```

---

## 🧪 Test Cases

### Test Case 1: Start Video → Save Progress

**Scenario:** User starts watching video for first time

**Step 1: Check no progress exists**
```bash
curl -X GET http://localhost:5000/progress/1 \
  -H "Authorization: Bearer TOKEN"
```

**Expected:**
```json
{ "progress": null }
```

**Step 2: Watch for 2 minutes (120 seconds)**
```bash
curl -X POST http://localhost:5000/progress/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"watchedDuration": 120, "completed": false}'
```

**Expected:**
```json
{
  "message": "Progress updated successfully",
  "progress": {
    "watched_duration": 120,
    "completed": false,
    "percentage": 20
  }
}
```

**Step 3: Verify saved**
```bash
curl -X GET http://localhost:5000/progress/1 \
  -H "Authorization: Bearer TOKEN"
```

**Expected:**
```json
{
  "progress": {
    "watched_duration": 120,
    "completed": 0
  }
}
```

**SQL Verification:**
```sql
SELECT * FROM video_progress WHERE user_id = 1 AND video_id = 1;
```

---

### Test Case 2: Resume Video → Correct Timestamp

**Scenario:** User returns to partially watched video

**Step 1: Save progress at 3 minutes**
```bash
curl -X POST http://localhost:5000/progress/1 \
  -H "Authorization: Bearer TOKEN" \
  -d '{"watchedDuration": 180, "completed": false}'
```

**Step 2: Get progress (simulate page reload)**
```bash
curl -X GET http://localhost:5000/progress/1 \
  -H "Authorization: Bearer TOKEN"
```

**Expected:**
```json
{
  "progress": {
    "watched_duration": 180,
    "video_title": "What is JavaScript?",
    "total_duration": 600
  }
}
```

**Step 3: Frontend resumes at 180 seconds**
```javascript
const resumePosition = progress.watched_duration; // 180
player.seekTo(resumePosition);
```

**Verify:**
- Video starts at 3:00 mark ✅
- Not from beginning ✅

---

### Test Case 3: Complete Video → Unlock Next

**Scenario:** User completes video, next video unlocks

**Step 1: Watch video to 95%**
```bash
# Video duration: 600 seconds
# 95% = 570 seconds
curl -X POST http://localhost:5000/progress/1 \
  -H "Authorization: Bearer TOKEN" \
  -d '{"watchedDuration": 570, "completed": false}'
```

**Expected:** Auto-completed
```json
{
  "progress": {
    "watched_duration": 570,
    "completed": true,
    "percentage": 95
  }
}
```

**Step 2: Check if next video unlocked**
```bash
curl -X GET http://localhost:5000/subjects/1/tree \
  -H "Authorization: Bearer TOKEN"
```

**Expected:**
```json
{
  "sections": [
    {
      "videos": [
        {
          "id": 1,
          "locked": false,
          "is_completed": true
        },
        {
          "id": 2,
          "locked": false,
          "is_completed": false
        }
      ]
    }
  ]
}
```

**Verify:**
- Video 1: `completed: true` ✅
- Video 2: `locked: false` ✅ (UNLOCKED)

**SQL Verification:**
```sql
-- Check completion
SELECT completed FROM video_progress WHERE video_id = 1;
-- Should return: 1

-- Check next video accessible
SELECT 
  v.id,
  v.title,
  CASE 
    WHEN (SELECT COUNT(*) FROM video_progress vp2 
          WHERE vp2.video_id < v.id 
          AND vp2.completed = 0) = 0 
    THEN 'Unlocked' 
    ELSE 'Locked' 
  END as status
FROM videos v
WHERE v.id = 2;
-- Should return: Unlocked
```

---

### Test Case 4: Duration Capping

**Scenario:** User sends invalid duration > video length

**Step 1: Try to save 15 minutes for 10-minute video**
```bash
# Video duration: 600 seconds (10 min)
# User sends: 900 seconds (15 min) - INVALID
curl -X POST http://localhost:5000/progress/1 \
  -H "Authorization: Bearer TOKEN" \
  -d '{"watchedDuration": 900, "completed": false}'
```

**Expected:** Capped to 600
```json
{
  "progress": {
    "watched_duration": 600,
    "completed": true,
    "percentage": 100
  }
}
```

**Verify:**
```sql
SELECT watched_duration, completed 
FROM video_progress 
WHERE video_id = 1;
-- watched_duration: 600 (not 900)
-- completed: 1 (auto-completed at 100%)
```

---

### Test Case 5: Multiple Updates (Upsert)

**Scenario:** Update progress multiple times

**Update 1:**
```bash
curl -X POST http://localhost:5000/progress/1 \
  -d '{"watchedDuration": 60}'
```

**Update 2:**
```bash
curl -X POST http://localhost:5000/progress/1 \
  -d '{"watchedDuration": 120}'
```

**Update 3:**
```bash
curl -X POST http://localhost:5000/progress/1 \
  -d '{"watchedDuration": 180}'
```

**Verify only ONE record exists:**
```sql
SELECT COUNT(*) FROM video_progress 
WHERE user_id = 1 AND video_id = 1;
-- Should return: 1 (not 3)

SELECT watched_duration FROM video_progress 
WHERE user_id = 1 AND video_id = 1;
-- Should return: 180 (latest value)
```

---

## 📊 SQL Queries

### Insert Progress (First Time)
```sql
INSERT INTO video_progress (user_id, video_id, watched_duration, completed)
VALUES (?, ?, ?, ?);
```

### Update Progress (Subsequent)
```sql
UPDATE video_progress 
SET watched_duration = ?, 
    completed = ?, 
    last_watched = NOW()
WHERE user_id = ? AND video_id = ?;
```

### Get Progress
```sql
SELECT 
  vp.*,
  v.duration as total_duration,
  v.title as video_title
FROM video_progress vp
JOIN videos v ON vp.video_id = v.id
WHERE vp.user_id = ? AND vp.video_id = ?;
```

### Get User Overall Progress
```sql
SELECT 
  sub.id as subject_id,
  sub.title as subject_title,
  COUNT(DISTINCT v.id) as total_videos,
  COUNT(DISTINCT CASE WHEN vp.completed = 1 THEN v.id END) as completed_videos,
  ROUND(
    (COUNT(DISTINCT CASE WHEN vp.completed = 1 THEN v.id END) / COUNT(DISTINCT v.id)) * 100,
    2
  ) as progress_percentage
FROM subjects sub
JOIN sections sec ON sub.id = sec.subject_id
JOIN videos v ON sec.id = v.section_id
LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
GROUP BY sub.id
ORDER BY sub.display_order;
```

### Check if Progress Exists
```sql
SELECT id FROM video_progress 
WHERE user_id = ? AND video_id = ?;
```

### Get Video Duration
```sql
SELECT duration FROM videos WHERE id = ?;
```

---

## 🔧 Frontend Integration

### Save Progress Every 5 Seconds
```javascript
setInterval(async () => {
  const currentTime = player.getCurrentTime();
  const duration = player.getDuration();
  
  await apiClient.post(`/progress/${videoId}`, {
    watchedDuration: Math.floor(currentTime),
    completed: currentTime >= duration - 5
  });
}, 5000);
```

### Resume on Load
```javascript
useEffect(() => {
  const loadProgress = async () => {
    const { data } = await apiClient.get(`/progress/${videoId}`);
    if (data.progress) {
      player.seekTo(data.progress.watched_duration);
    }
  };
  loadProgress();
}, [videoId]);
```

### Show Progress Bar
```javascript
const progress = (watchedDuration / totalDuration) * 100;

<div className="w-full bg-gray-200 h-2 rounded">
  <div 
    className="bg-blue-600 h-2 rounded"
    style={{ width: `${progress}%` }}
  />
</div>
```

---

## ✅ Verification Checklist

- [ ] POST /progress/:videoId saves progress
- [ ] GET /progress/:videoId returns progress
- [ ] GET /progress returns overall progress
- [ ] Upsert works (no duplicate records)
- [ ] Duration capped to video length
- [ ] Auto-complete at 95%
- [ ] Resume works correctly
- [ ] Completing video unlocks next
- [ ] last_watched timestamp updates

---

## 🎯 Complete Test Sequence

```bash
# 1. Start video
POST /progress/1 {"watchedDuration": 60}

# 2. Continue watching
POST /progress/1 {"watchedDuration": 120}

# 3. Get progress
GET /progress/1

# 4. Complete video
POST /progress/1 {"watchedDuration": 600, "completed": true}

# 5. Check next video unlocked
GET /subjects/1/tree

# 6. Get overall progress
GET /progress
```

---

**Your progress tracking system is complete!** 📊✅
