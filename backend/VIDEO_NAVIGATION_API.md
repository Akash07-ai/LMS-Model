# Video Navigation API - Complete Guide

## 📡 API Endpoints

### 1. GET /videos/:videoId

Get video details with navigation (prev/next) and lock status.

**Authentication:** Required

**Response:**
```json
{
  "id": 1,
  "title": "What is JavaScript?",
  "description": "Introduction to JavaScript",
  "youtube_url": "https://www.youtube.com/watch?v=W6NZfCO5SIk",
  "youtube_id": "W6NZfCO5SIk",
  "duration": 600,
  "subject_id": 1,
  "subject_title": "JavaScript Fundamentals",
  "section_title": "Introduction to JavaScript",
  "watched_duration": 120,
  "completed": false,
  "locked": false,
  "previous_video_id": null,
  "next_video_id": 2
}
```

**Locked Video Response (403):**
```json
{
  "message": "Video is locked. Complete previous videos first.",
  "locked": true
}
```

---

### 2. GET /videos/:videoId/next

Get next video in sequence.

**Response:**
```json
{
  "video": {
    "id": 2,
    "title": "Setting up Development Environment",
    "youtube_id": "PkZNo7MFNFg",
    "duration": 720,
    "section_title": "Introduction to JavaScript"
  }
}
```

**No Next Video:**
```json
{
  "video": null,
  "message": "No more videos"
}
```

---

### 3. GET /videos/:videoId/previous

Get previous video in sequence.

**Response:**
```json
{
  "video": {
    "id": 1,
    "title": "What is JavaScript?",
    "youtube_id": "W6NZfCO5SIk",
    "duration": 600,
    "section_title": "Introduction to JavaScript"
  }
}
```

**No Previous Video:**
```json
{
  "video": null,
  "message": "No previous video"
}
```

---

### 4. GET /subjects/:subjectId/first-video

Get first video of a subject (always unlocked).

**Response:**
```json
{
  "video": {
    "id": 1,
    "title": "What is JavaScript?",
    "youtube_id": "W6NZfCO5SIk",
    "duration": 600,
    "section_title": "Introduction to JavaScript",
    "subject_title": "JavaScript Fundamentals"
  }
}
```

---

## 🧮 Navigation Algorithm

### Sequential Video Ordering

Videos are ordered by:
1. **Section order** (display_order)
2. **Video order within section** (display_order)

**Example:**
```
Subject: JavaScript Fundamentals
├── Section 1 (order: 1)
│   ├── Video 1 (order: 1) ← First video
│   ├── Video 2 (order: 2)
│   └── Video 3 (order: 3)
├── Section 2 (order: 2)
│   ├── Video 4 (order: 1)
│   ├── Video 5 (order: 2)
│   └── Video 6 (order: 3)
└── Section 3 (order: 3)
    ├── Video 7 (order: 1)
    ├── Video 8 (order: 2)
    └── Video 9 (order: 3) ← Last video
```

---

### Previous Video Algorithm

**SQL Query:**
```sql
SELECT v.id, v.title
FROM videos v
JOIN sections sec ON v.section_id = sec.id
WHERE sec.subject_id = ?
AND (
  (sec.display_order = ? AND v.display_order < ?)  -- Same section, earlier video
  OR sec.display_order < ?                          -- Earlier section
)
ORDER BY sec.display_order DESC, v.display_order DESC
LIMIT 1;
```

**Logic:**
1. Find videos in **same section** with **lower display_order**
2. OR find videos in **earlier sections**
3. Sort **descending** to get the immediate previous
4. Return **first result**

**Example:**
- Current: Video 4 (Section 2, Order 1)
- Previous: Video 3 (Section 1, Order 3) ✅

---

### Next Video Algorithm

**SQL Query:**
```sql
SELECT v.id, v.title
FROM videos v
JOIN sections sec ON v.section_id = sec.id
WHERE sec.subject_id = ?
AND (
  (sec.display_order = ? AND v.display_order > ?)  -- Same section, later video
  OR sec.display_order > ?                          -- Later section
)
ORDER BY sec.display_order ASC, v.display_order ASC
LIMIT 1;
```

**Logic:**
1. Find videos in **same section** with **higher display_order**
2. OR find videos in **later sections**
3. Sort **ascending** to get the immediate next
4. Return **first result**

**Example:**
- Current: Video 3 (Section 1, Order 3)
- Next: Video 4 (Section 2, Order 1) ✅

---

### Video Unlock Algorithm

**SQL Query:**
```sql
SELECT v.id, vp.completed
FROM videos v
JOIN sections sec ON v.section_id = sec.id
LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
WHERE sec.subject_id = ?
AND (
  sec.display_order < (SELECT display_order FROM sections WHERE id = ?)
  OR (
    sec.display_order = (SELECT display_order FROM sections WHERE id = ?)
    AND v.display_order < (SELECT display_order FROM videos WHERE id = ?)
  )
)
ORDER BY sec.display_order, v.display_order;
```

**Logic:**
1. Get **all videos before** current video
2. Check if **all previous videos** are completed
3. If **no previous videos** → First video → **Unlocked**
4. If **any previous incomplete** → **Locked**
5. If **all previous complete** → **Unlocked**

**Pseudocode:**
```javascript
function isVideoUnlocked(userId, videoId, subjectId) {
  previousVideos = getAllPreviousVideos(videoId, subjectId);
  
  if (previousVideos.length === 0) {
    return true; // First video is always unlocked
  }
  
  return previousVideos.every(v => v.completed === true);
}
```

---

## 🧪 Test Cases

### Test 1: Previous/Next Navigation Works

**Setup:**
```sql
-- Get video 2
SELECT * FROM videos WHERE id = 2;
```

**Test Previous:**
```bash
curl -X GET http://localhost:5000/videos/2/previous \
  -H "Authorization: Bearer TOKEN"
```

**Expected:**
```json
{
  "video": {
    "id": 1,
    "title": "What is JavaScript?"
  }
}
```

**Test Next:**
```bash
curl -X GET http://localhost:5000/videos/2/next \
  -H "Authorization: Bearer TOKEN"
```

**Expected:**
```json
{
  "video": {
    "id": 3,
    "title": "Your First JavaScript Program"
  }
}
```

---

### Test 2: Locked Videos Blocked

**Setup:**
```sql
-- User has NOT completed video 1
SELECT * FROM video_progress WHERE user_id = 1 AND video_id = 1;
-- Should return empty or completed = 0
```

**Test:**
```bash
curl -X GET http://localhost:5000/videos/2 \
  -H "Authorization: Bearer TOKEN"
```

**Expected:** `403 Forbidden`
```json
{
  "message": "Video is locked. Complete previous videos first.",
  "locked": true
}
```

---

### Test 3: Correct Order Maintained

**Test First Video:**
```bash
curl -X GET http://localhost:5000/subjects/1/first-video \
  -H "Authorization: Bearer TOKEN"
```

**Expected:**
```json
{
  "video": {
    "id": 1,
    "title": "What is JavaScript?"
  }
}
```

**Test Video Details:**
```bash
curl -X GET http://localhost:5000/videos/5 \
  -H "Authorization: Bearer TOKEN"
```

**Expected:**
```json
{
  "id": 5,
  "previous_video_id": 4,
  "next_video_id": 6
}
```

**Verify Order:**
```sql
-- Check video sequence
SELECT 
  v.id,
  v.title,
  sec.display_order as section_order,
  v.display_order as video_order,
  ROW_NUMBER() OVER (ORDER BY sec.display_order, v.display_order) as sequence
FROM videos v
JOIN sections sec ON v.section_id = sec.id
WHERE sec.subject_id = 1
ORDER BY sec.display_order, v.display_order;
```

---

## 📊 SQL Queries Reference

### Get Video with Navigation
```sql
-- Main video query
SELECT 
  v.*,
  sec.title as section_title,
  sec.subject_id,
  sec.display_order as section_order,
  sub.title as subject_title,
  vp.watched_duration,
  vp.completed
FROM videos v
JOIN sections sec ON v.section_id = sec.id
JOIN subjects sub ON sec.subject_id = sub.id
LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
WHERE v.id = ?;

-- Previous video
SELECT v.id, v.title
FROM videos v
JOIN sections sec ON v.section_id = sec.id
WHERE sec.subject_id = ?
AND (
  (sec.display_order = ? AND v.display_order < ?)
  OR sec.display_order < ?
)
ORDER BY sec.display_order DESC, v.display_order DESC
LIMIT 1;

-- Next video
SELECT v.id, v.title
FROM videos v
JOIN sections sec ON v.section_id = sec.id
WHERE sec.subject_id = ?
AND (
  (sec.display_order = ? AND v.display_order > ?)
  OR sec.display_order > ?
)
ORDER BY sec.display_order ASC, v.display_order ASC
LIMIT 1;
```

### Get First Video
```sql
SELECT 
  v.id,
  v.title,
  v.youtube_id,
  v.duration,
  sec.title as section_title,
  sub.title as subject_title
FROM videos v
JOIN sections sec ON v.section_id = sec.id
JOIN subjects sub ON sec.subject_id = sub.id
WHERE sec.subject_id = ?
ORDER BY sec.display_order, v.display_order
LIMIT 1;
```

### Check Video Unlock Status
```sql
-- Get all previous videos
SELECT 
  v.id,
  vp.completed
FROM videos v
JOIN sections sec ON v.section_id = sec.id
LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
WHERE sec.subject_id = ?
AND (
  sec.display_order < (SELECT display_order FROM sections WHERE id = (SELECT section_id FROM videos WHERE id = ?))
  OR (
    sec.display_order = (SELECT display_order FROM sections WHERE id = (SELECT section_id FROM videos WHERE id = ?))
    AND v.display_order < (SELECT display_order FROM videos WHERE id = ?)
  )
)
ORDER BY sec.display_order, v.display_order;

-- Video is unlocked if:
-- 1. No previous videos (first video)
-- 2. All previous videos have completed = 1
```

---

## 🎯 Complete Test Sequence

### 1. Get First Video
```bash
curl -X GET http://localhost:5000/subjects/1/first-video \
  -H "Authorization: Bearer TOKEN"
```

### 2. Get Video Details
```bash
curl -X GET http://localhost:5000/videos/1 \
  -H "Authorization: Bearer TOKEN"
```

### 3. Check Navigation
```bash
# Previous (should be null for first video)
curl -X GET http://localhost:5000/videos/1/previous \
  -H "Authorization: Bearer TOKEN"

# Next (should return video 2)
curl -X GET http://localhost:5000/videos/1/next \
  -H "Authorization: Bearer TOKEN"
```

### 4. Try Locked Video
```bash
# Should return 403
curl -X GET http://localhost:5000/videos/5 \
  -H "Authorization: Bearer TOKEN"
```

### 5. Complete Video & Check Next
```bash
# Complete video 1
curl -X POST http://localhost:5000/progress/1 \
  -H "Authorization: Bearer TOKEN" \
  -d '{"watchedDuration": 600, "completed": true}'

# Now video 2 should be accessible
curl -X GET http://localhost:5000/videos/2 \
  -H "Authorization: Bearer TOKEN"
```

---

## ✅ Verification Checklist

- [ ] GET /videos/:id returns video with prev/next IDs
- [ ] Locked videos return 403
- [ ] First video has previous_video_id = null
- [ ] Last video has next_video_id = null
- [ ] Previous/next navigation works across sections
- [ ] First video endpoint returns correct video
- [ ] Navigation maintains correct order
- [ ] Unlock logic prevents skipping

---

## 🔧 Debug Queries

### Check Video Sequence
```sql
SELECT 
  v.id,
  v.title,
  sec.title as section,
  sec.display_order as sec_order,
  v.display_order as vid_order,
  ROW_NUMBER() OVER (ORDER BY sec.display_order, v.display_order) as global_order
FROM videos v
JOIN sections sec ON v.section_id = sec.id
WHERE sec.subject_id = 1
ORDER BY sec.display_order, v.display_order;
```

### Check Navigation Links
```sql
-- For video ID = 5
WITH current AS (
  SELECT v.*, sec.subject_id, sec.display_order as sec_order
  FROM videos v
  JOIN sections sec ON v.section_id = sec.id
  WHERE v.id = 5
)
SELECT 
  'Previous' as type,
  v.id,
  v.title
FROM videos v
JOIN sections sec ON v.section_id = sec.id
CROSS JOIN current c
WHERE sec.subject_id = c.subject_id
AND (
  (sec.display_order = c.sec_order AND v.display_order < c.display_order)
  OR sec.display_order < c.sec_order
)
ORDER BY sec.display_order DESC, v.display_order DESC
LIMIT 1

UNION ALL

SELECT 
  'Next' as type,
  v.id,
  v.title
FROM videos v
JOIN sections sec ON v.section_id = sec.id
CROSS JOIN current c
WHERE sec.subject_id = c.subject_id
AND (
  (sec.display_order = c.sec_order AND v.display_order > c.display_order)
  OR sec.display_order > c.sec_order
)
ORDER BY sec.display_order ASC, v.display_order ASC
LIMIT 1;
```

---

**Test the navigation system now!** 🎥🚀
