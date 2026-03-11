# Database Schema Verification Guide

## ✅ Schema Already Created

Your database schema includes:

### Tables:
1. **users** - User accounts
2. **refresh_tokens** - JWT refresh tokens (secure storage)
3. **subjects** - Course subjects
4. **sections** - Subject sections
5. **videos** - Video lessons
6. **video_progress** - User video watch progress

### Features:
- ✅ Foreign keys with CASCADE DELETE
- ✅ Unique indexes (email, user_video progress)
- ✅ Proper ordering (display_order fields)
- ✅ Timestamps for tracking

---

## 🌱 Seed Sample Data

Run this command to add sample subjects, sections, and videos:

```bash
cd backend
npm run seed-db
```

**This adds:**
- 3 Subjects (JavaScript, React, Node.js)
- 9 Sections (3 per subject)
- 27 Videos (3 per section)

---

## 🧪 Verify Database

### Option 1: MySQL Command Line

Open MySQL Command Line Client, enter password: `Akash@9906`

```sql
USE lms_db;

-- Check all tables
SHOW TABLES;

-- Count records
SELECT 'subjects' AS table_name, COUNT(*) AS count FROM subjects
UNION ALL
SELECT 'sections', COUNT(*) FROM sections
UNION ALL
SELECT 'videos', COUNT(*) FROM videos;

-- View all subjects
SELECT * FROM subjects ORDER BY display_order;

-- View subjects with sections
SELECT 
    s.title AS subject,
    sec.title AS section,
    COUNT(v.id) AS video_count
FROM subjects s
JOIN sections sec ON s.id = sec.subject_id
LEFT JOIN videos v ON sec.id = v.section_id
GROUP BY s.id, sec.id
ORDER BY s.display_order, sec.display_order;
```

### Option 2: Run Verification Script

```bash
mysql -u root -p lms_db < backend/verify.sql
```

---

## 🔍 Test Queries

### 1. Check Foreign Keys

```sql
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'lms_db' 
AND REFERENCED_TABLE_NAME IS NOT NULL;
```

**Expected:**
- refresh_tokens → users
- sections → subjects
- videos → sections
- video_progress → users, videos

### 2. Check Unique Indexes

```sql
SHOW INDEX FROM users WHERE Key_name = 'email';
SHOW INDEX FROM video_progress WHERE Key_name = 'unique_user_video';
```

### 3. Test Cascading Delete

```sql
-- See what would be deleted
SELECT 'Subject' AS type, id, title FROM subjects WHERE id = 1
UNION ALL
SELECT 'Section', id, title FROM sections WHERE subject_id = 1
UNION ALL
SELECT 'Video', v.id, v.title FROM videos v 
JOIN sections s ON v.section_id = s.id WHERE s.subject_id = 1;

-- DON'T RUN THIS (it will delete data):
-- DELETE FROM subjects WHERE id = 1;
```

### 4. Get First Video (Sequential Unlocking)

```sql
SELECT 
    sub.title AS subject,
    v.id AS video_id,
    v.title AS video_title,
    v.youtube_id
FROM subjects sub
JOIN sections sec ON sub.id = sec.subject_id
JOIN videos v ON sec.id = v.section_id
WHERE sec.display_order = 1 AND v.display_order = 1
ORDER BY sub.display_order;
```

### 5. Insert Sample Progress

```sql
-- Replace user_id = 1 with your actual user ID
INSERT INTO video_progress (user_id, video_id, watched_duration, completed)
VALUES (1, 1, 600, TRUE);

-- Check progress
SELECT 
    v.title,
    vp.watched_duration,
    v.duration,
    vp.completed
FROM video_progress vp
JOIN videos v ON vp.video_id = v.id
WHERE vp.user_id = 1;
```

---

## 📊 Expected Results

After seeding, you should have:

| Table | Count |
|-------|-------|
| subjects | 3 |
| sections | 9 |
| videos | 27 |
| users | 1+ (from registration) |
| refresh_tokens | 1+ (from login) |
| video_progress | 0 (until user watches videos) |

---

## 🎯 Next Steps

1. ✅ Schema created
2. ✅ Sample data seeded
3. ⏳ Build subject/video APIs
4. ⏳ Implement sequential unlocking
5. ⏳ Add progress tracking

---

## 🔧 Troubleshooting

**If seed fails:**
```bash
# Clear existing data
mysql -u root -p
USE lms_db;
DELETE FROM videos;
DELETE FROM sections;
DELETE FROM subjects;

# Re-run seed
npm run seed-db
```

**Check for errors:**
```sql
SELECT * FROM subjects;
SELECT * FROM sections;
SELECT * FROM videos;
```
