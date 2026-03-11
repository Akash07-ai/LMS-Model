-- ========================================
-- DATABASE SCHEMA VERIFICATION QUERIES
-- ========================================

-- 1. Check all tables exist
SHOW TABLES;

-- 2. Verify table structures
DESCRIBE users;
DESCRIBE refresh_tokens;
DESCRIBE subjects;
DESCRIBE sections;
DESCRIBE videos;
DESCRIBE video_progress;

-- 3. Check foreign keys
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'lms_db' 
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 4. Check unique indexes
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'lms_db'
AND NON_UNIQUE = 0;

-- 5. Count records in each table
SELECT 'users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'subjects', COUNT(*) FROM subjects
UNION ALL
SELECT 'sections', COUNT(*) FROM sections
UNION ALL
SELECT 'videos', COUNT(*) FROM videos
UNION ALL
SELECT 'video_progress', COUNT(*) FROM video_progress
UNION ALL
SELECT 'refresh_tokens', COUNT(*) FROM refresh_tokens;

-- 6. View all subjects with section count
SELECT 
    s.id,
    s.title,
    s.description,
    s.display_order,
    COUNT(sec.id) AS section_count
FROM subjects s
LEFT JOIN sections sec ON s.id = sec.subject_id
GROUP BY s.id
ORDER BY s.display_order;

-- 7. View all sections with video count
SELECT 
    sec.id,
    sec.title AS section_title,
    sub.title AS subject_title,
    sec.display_order,
    COUNT(v.id) AS video_count
FROM sections sec
JOIN subjects sub ON sec.subject_id = sub.id
LEFT JOIN videos v ON sec.id = v.section_id
GROUP BY sec.id
ORDER BY sub.display_order, sec.display_order;

-- 8. View all videos with section and subject info
SELECT 
    v.id,
    v.title AS video_title,
    v.youtube_id,
    v.duration,
    v.display_order AS video_order,
    sec.title AS section_title,
    sub.title AS subject_title
FROM videos v
JOIN sections sec ON v.section_id = sec.id
JOIN subjects sub ON sec.subject_id = sub.id
ORDER BY sub.display_order, sec.display_order, v.display_order;

-- 9. Get first video of each subject (for sequential unlocking)
SELECT 
    sub.id AS subject_id,
    sub.title AS subject_title,
    v.id AS first_video_id,
    v.title AS first_video_title,
    v.youtube_id
FROM subjects sub
JOIN sections sec ON sub.id = sec.subject_id
JOIN videos v ON sec.id = v.section_id
WHERE sec.display_order = 1 AND v.display_order = 1
ORDER BY sub.display_order;

-- 10. Test cascading delete (DON'T RUN IN PRODUCTION)
-- This shows what would be deleted if you delete a subject
SELECT 
    'Subject' AS level,
    s.id,
    s.title AS name
FROM subjects s
WHERE s.id = 1
UNION ALL
SELECT 
    'Section',
    sec.id,
    sec.title
FROM sections sec
WHERE sec.subject_id = 1
UNION ALL
SELECT 
    'Video',
    v.id,
    v.title
FROM videos v
JOIN sections sec ON v.section_id = sec.id
WHERE sec.subject_id = 1;

-- 11. Check video progress for a user (replace user_id = 1 with actual user)
SELECT 
    u.name AS user_name,
    sub.title AS subject,
    sec.title AS section,
    v.title AS video,
    vp.watched_duration,
    v.duration AS total_duration,
    ROUND((vp.watched_duration / v.duration) * 100, 2) AS progress_percentage,
    vp.completed,
    vp.last_watched
FROM video_progress vp
JOIN users u ON vp.user_id = u.id
JOIN videos v ON vp.video_id = v.id
JOIN sections sec ON v.section_id = sec.id
JOIN subjects sub ON sec.subject_id = sub.id
WHERE u.id = 1
ORDER BY sub.display_order, sec.display_order, v.display_order;

-- 12. Get next unlocked video for a user (sequential unlocking logic)
-- This finds the first incomplete video
SELECT 
    v.id,
    v.title,
    v.youtube_id,
    sec.title AS section_title,
    sub.title AS subject_title
FROM videos v
JOIN sections sec ON v.section_id = sec.id
JOIN subjects sub ON sec.subject_id = sub.id
LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = 1
WHERE vp.completed IS NULL OR vp.completed = FALSE
ORDER BY sub.display_order, sec.display_order, v.display_order
LIMIT 1;
