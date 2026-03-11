# Video Locking System - Complete Test Guide

## 🔒 Sequential Locking Rules

1. **First video** of first section is always **unlocked**
2. Each video unlocks **only after** the previous video is **completed**
3. Videos unlock **sequentially** across sections
4. No skipping allowed - strict order enforcement

---

## 📡 API Endpoint

### GET /subjects/:subjectId/tree

**Purpose:** Get complete subject structure with locking status

**Authentication:** Required (Bearer token)

**Response Format:**
```json
{
  "id": 1,
  "title": "JavaScript Fundamentals",
  "description": "Learn the basics of JavaScript programming",
  "sections": [
    {
      "id": 1,
      "title": "Introduction to JavaScript",
      "display_order": 1,
      "videos": [
        {
          "id": 1,
          "title": "What is JavaScript?",
          "youtube_id": "W6NZfCO5SIk",
          "duration": 600,
          "order_index": 1,
          "locked": false,
          "is_completed": false,
          "watched_duration": 0
        },
        {
          "id": 2,
          "title": "Setting up Development Environment",
          "youtube_id": "PkZNo7MFNFg",
          "duration": 720,
          "order_index": 2,
          "locked": true,
          "is_completed": false,
          "watched_duration": 0
        }
      ]
    }
  ]
}
```

---

## 🧪 Test Cases

### Test Case 1: New User - Only First Video Unlocked

**Scenario:** User has never watched any videos

**SQL Query:**
```sql
-- Check user progress (should be empty)
SELECT * FROM video_progress WHERE user_id = 1;

-- Get subject tree
SELECT 
  v.id,
  v.title,
  v.display_order as order_index,
  sec.display_order as section_order,
  COALESCE(vp.completed, 0) as is_completed
FROM videos v
JOIN sections sec ON v.section_id = sec.id
LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = 1
WHERE sec.subject_id = 1
ORDER BY sec.display_order, v.display_order;
```

**Expected Result:**
- Video 1: `locked: false` ✅
- Video 2: `locked: true` 🔒
- Video 3: `locked: true` 🔒
- All others: `locked: true` 🔒

**Postman Test:**
```
GET http://localhost:5000/subjects/1/tree
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Verify:**
```javascript
// Only first video unlocked
response.sections[0].videos[0].locked === false
response.sections[0].videos[1].locked === true
```

---

### Test Case 2: Complete First Video - Second Unlocks

**Scenario:** User completes first video

**Step 1: Mark first video as completed**
```sql
INSERT INTO video_progress (user_id, video_id, watched_duration, completed)
VALUES (1, 1, 600, TRUE);
```

**Or via API:**
```
POST http://localhost:5000/progress/1
Authorization: Bearer YOUR_ACCESS_TOKEN
Body:
{
  "watchedDuration": 600,
  "completed": true
}
```

**Step 2: Get updated tree**
```
GET http://localhost:5000/subjects/1/tree
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Result:**
- Video 1: `locked: false`, `is_completed: true` ✅
- Video 2: `locked: false` ✅ (NOW UNLOCKED)
- Video 3: `locked: true` 🔒
- All others: `locked: true` 🔒

**SQL Verification:**
```sql
-- Check progress
SELECT 
  v.id,
  v.title,
  COALESCE(vp.completed, 0) as completed
FROM videos v
LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = 1
WHERE v.section_id = 1
ORDER BY v.display_order;
```

---

### Test Case 3: Complete Section - Next Section Unlocks

**Scenario:** User completes all videos in first section

**Step 1: Complete all videos in section 1**
```sql
-- Complete video 1
INSERT INTO video_progress (user_id, video_id, watched_duration, completed)
VALUES (1, 1, 600, TRUE);

-- Complete video 2
INSERT INTO video_progress (user_id, video_id, watched_duration, completed)
VALUES (1, 2, 720, TRUE);

-- Complete video 3
INSERT INTO video_progress (user_id, video_id, watched_duration, completed)
VALUES (1, 3, 540, TRUE);
```

**Or via API (for each video):**
```
POST http://localhost:5000/progress/1
POST http://localhost:5000/progress/2
POST http://localhost:5000/progress/3
Body: { "watchedDuration": <duration>, "completed": true }
```

**Step 2: Get tree**
```
GET http://localhost:5000/subjects/1/tree
```

**Expected Result:**
- Section 1, Video 1-3: `locked: false`, `is_completed: true` ✅
- Section 2, Video 1: `locked: false` ✅ (FIRST VIDEO OF NEXT SECTION UNLOCKED)
- Section 2, Video 2: `locked: true` 🔒
- All others: `locked: true` 🔒

**SQL Verification:**
```sql
-- Check section completion
SELECT 
  sec.id as section_id,
  sec.title as section_title,
  COUNT(v.id) as total_videos,
  COUNT(vp.id) as completed_videos,
  CASE 
    WHEN COUNT(v.id) = COUNT(vp.id) THEN 'Complete'
    ELSE 'Incomplete'
  END as status
FROM sections sec
JOIN videos v ON sec.id = v.section_id
LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = 1 AND vp.completed = 1
WHERE sec.subject_id = 1
GROUP BY sec.id
ORDER BY sec.display_order;
```

---

### Test Case 4: Try to Access Locked Video

**Scenario:** User tries to watch a locked video

**Request:**
```
GET http://localhost:5000/videos/5
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response:** `403 Forbidden`
```json
{
  "message": "Video is locked. Complete previous videos first."
}
```

**SQL Check (Video Unlock Logic):**
```sql
-- Check if video 5 should be unlocked
-- Get all previous videos
SELECT 
  v.id,
  v.title,
  COALESCE(vp.completed, 0) as completed
FROM videos v
JOIN sections sec ON v.section_id = sec.id
LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = 1
WHERE sec.subject_id = 1
AND (
  sec.display_order < (SELECT display_order FROM sections WHERE id = (SELECT section_id FROM videos WHERE id = 5))
  OR (
    sec.display_order = (SELECT display_order FROM sections WHERE id = (SELECT section_id FROM videos WHERE id = 5))
    AND v.display_order < (SELECT display_order FROM videos WHERE id = 5)
  )
)
ORDER BY sec.display_order, v.display_order;

-- Video 5 is unlocked ONLY if ALL previous videos have completed = 1
```

---

## 📊 SQL Queries Used

### 1. Get Subject Tree with Locking
```sql
SELECT 
  v.id,
  v.section_id,
  v.title,
  v.youtube_id,
  v.duration,
  v.display_order as order_index,
  sec.display_order as section_order,
  COALESCE(vp.completed, 0) as is_completed,
  COALESCE(vp.watched_duration, 0) as watched_duration
FROM videos v
JOIN sections sec ON v.section_id = sec.id
LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
WHERE sec.subject_id = ?
ORDER BY sec.display_order, v.display_order;
```

### 2. Check Video Unlock Status
```sql
-- Get all previous videos for video_id = X
SELECT 
  v.id,
  COALESCE(vp.completed, 0) as completed
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
```

### 3. Update Video Progress
```sql
-- Insert or update progress
INSERT INTO video_progress (user_id, video_id, watched_duration, completed)
VALUES (?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
  watched_duration = VALUES(watched_duration),
  completed = VALUES(completed),
  last_watched = NOW();
```

### 4. Get User Progress Summary
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

---

## 🧪 Complete Test Sequence

### 1. Setup Test User
```sql
-- Get user ID after login
SELECT id FROM users WHERE email = 'test@example.com';
-- Let's say user_id = 1
```

### 2. Test Initial State
```bash
# Get tree - only first video unlocked
curl -X GET http://localhost:5000/subjects/1/tree \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Complete First Video
```bash
curl -X POST http://localhost:5000/progress/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"watchedDuration": 600, "completed": true}'
```

### 4. Verify Second Video Unlocked
```bash
curl -X GET http://localhost:5000/subjects/1/tree \
  -H "Authorization: Bearer YOUR_TOKEN"
# Check: videos[1].locked should be false
```

### 5. Try Accessing Locked Video
```bash
curl -X GET http://localhost:5000/videos/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return 403 Forbidden
```

### 6. Complete Entire Section
```bash
# Complete videos 2 and 3
curl -X POST http://localhost:5000/progress/2 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"watchedDuration": 720, "completed": true}'

curl -X POST http://localhost:5000/progress/3 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"watchedDuration": 540, "completed": true}'
```

### 7. Verify Next Section Unlocked
```bash
curl -X GET http://localhost:5000/subjects/1/tree \
  -H "Authorization: Bearer YOUR_TOKEN"
# Check: sections[1].videos[0].locked should be false
```

---

## ✅ Verification Checklist

- [ ] New user sees only first video unlocked
- [ ] Completing video unlocks next video
- [ ] Locked videos return 403 when accessed
- [ ] Completing section unlocks first video of next section
- [ ] Progress persists across sessions
- [ ] Locking logic works across all subjects
- [ ] Cannot skip videos
- [ ] Tree endpoint returns correct lock status

---

## 🔧 Debug Queries

### Check Current Progress
```sql
SELECT 
  u.name,
  sub.title as subject,
  sec.title as section,
  v.title as video,
  v.display_order,
  vp.completed,
  vp.watched_duration
FROM video_progress vp
JOIN users u ON vp.user_id = u.id
JOIN videos v ON vp.video_id = v.id
JOIN sections sec ON v.section_id = sec.id
JOIN subjects sub ON sec.subject_id = sub.id
WHERE u.id = 1
ORDER BY sub.display_order, sec.display_order, v.display_order;
```

### Reset User Progress
```sql
-- WARNING: This deletes all progress for user
DELETE FROM video_progress WHERE user_id = 1;
```

### Check Locking Logic
```sql
-- See which videos should be unlocked for user 1 in subject 1
WITH ordered_videos AS (
  SELECT 
    v.id,
    v.title,
    ROW_NUMBER() OVER (ORDER BY sec.display_order, v.display_order) as video_sequence,
    COALESCE(vp.completed, 0) as completed
  FROM videos v
  JOIN sections sec ON v.section_id = sec.id
  LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = 1
  WHERE sec.subject_id = 1
)
SELECT 
  id,
  title,
  video_sequence,
  completed,
  CASE 
    WHEN video_sequence = 1 THEN 'Unlocked'
    WHEN (SELECT COUNT(*) FROM ordered_videos ov2 
          WHERE ov2.video_sequence < ordered_videos.video_sequence 
          AND ov2.completed = 0) = 0 THEN 'Unlocked'
    ELSE 'Locked'
  END as lock_status
FROM ordered_videos;
```

---

**Test the system now and verify all locking rules work correctly!** 🔒🚀
