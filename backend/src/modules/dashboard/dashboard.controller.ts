import { Request, Response } from 'express';
import { pool } from '../../config/db';
import { RowDataPacket } from 'mysql2';

// GET /dashboard-data
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    // Continue learning - last watched incomplete video
    const [continueRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        v.id as video_id, v.title as video_title, v.youtube_id, v.duration,
        vp.watched_duration, sec.subject_id,
        sub.title as subject_title
       FROM video_progress vp
       JOIN videos v ON vp.video_id = v.id
       JOIN sections sec ON v.section_id = sec.id
       JOIN subjects sub ON sec.subject_id = sub.id
       WHERE vp.user_id = ? AND vp.completed = 0 AND vp.watched_duration > 0
       ORDER BY vp.last_watched DESC
       LIMIT 1`,
      [userId]
    );

    // Recent activity - last 5 watched videos
    const [activityRows] = await pool.query<RowDataPacket[]>(
      `SELECT v.title as video_title, sub.title as subject_title,
              vp.last_watched, vp.completed
       FROM video_progress vp
       JOIN videos v ON vp.video_id = v.id
       JOIN sections sec ON v.section_id = sec.id
       JOIN subjects sub ON sec.subject_id = sub.id
       WHERE vp.user_id = ?
       ORDER BY vp.last_watched DESC
       LIMIT 5`,
      [userId]
    );

    // Stats
    const [statsRows] = await pool.query<RowDataPacket[]>(
      `SELECT
        COUNT(CASE WHEN vp.completed = 1 THEN 1 END) as total_completed,
        COUNT(DISTINCT sec.subject_id) as courses_started,
        SUM(vp.watched_duration) as total_seconds
       FROM video_progress vp
       JOIN videos v ON vp.video_id = v.id
       JOIN sections sec ON v.section_id = sec.id
       WHERE vp.user_id = ?`,
      [userId]
    );

    // Courses completed (all videos done)
    const [completedCoursesRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as courses_completed FROM (
        SELECT sec.subject_id
        FROM videos v
        JOIN sections sec ON v.section_id = sec.id
        LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
        GROUP BY sec.subject_id
        HAVING COUNT(v.id) = SUM(CASE WHEN vp.completed = 1 THEN 1 ELSE 0 END)
       ) as completed`,
      [userId]
    );

    // Subject progress
    const [subjectRows] = await pool.query<RowDataPacket[]>(
      `SELECT sub.id, sub.title, sub.display_order,
              COUNT(v.id) as total_videos,
              SUM(CASE WHEN vp.completed = 1 THEN 1 ELSE 0 END) as completed_videos,
              COALESCE(SUM(vp.watched_duration), 0) as total_watched_seconds
       FROM subjects sub
       JOIN sections sec ON sub.id = sec.subject_id
       JOIN videos v ON sec.id = v.section_id
       LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
       GROUP BY sub.id
       ORDER BY sub.display_order`,
      [userId]
    );

    // Weekly activity (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const [weeklyRows] = await pool.query<RowDataPacket[]>(
      `SELECT DAYOFWEEK(vp.last_watched) as dow,
              ROUND(SUM(vp.watched_duration) / 60, 1) as minutes
       FROM video_progress vp
       WHERE vp.user_id = ? AND vp.last_watched >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DAYOFWEEK(vp.last_watched)`,
      [userId]
    );

    const weeklyMap: Record<number, number> = {};
    weeklyRows.forEach((r: any) => { weeklyMap[r.dow] = r.minutes; });
    const weeklyActivity = days.map((day, i) => ({
      day,
      minutes: weeklyMap[i + 1] || 0
    }));

    // Streak - consecutive days with activity
    const [streakRows] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT DATE(last_watched) as day
       FROM video_progress
       WHERE user_id = ?
       ORDER BY day DESC
       LIMIT 30`,
      [userId]
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < streakRows.length; i++) {
      const d = new Date(streakRows[i].day);
      d.setHours(0, 0, 0, 0);
      const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
      if (diff === i || diff === i + 1) streak++;
      else break;
    }

    // Upcoming - next unlocked incomplete videos
    const [upcomingRows] = await pool.query<RowDataPacket[]>(
      `SELECT v.id as video_id, v.title, sub.title as subject,
              COALESCE(ROUND(vp.watched_duration * 100.0 / v.duration, 0), 0) as progress
       FROM videos v
       JOIN sections sec ON v.section_id = sec.id
       JOIN subjects sub ON sec.subject_id = sub.id
       LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
       WHERE (vp.completed IS NULL OR vp.completed = 0)
       ORDER BY sub.display_order, sec.display_order, v.display_order
       LIMIT 5`,
      [userId]
    );

    const upcoming = upcomingRows.map((r: any) => ({
      ...r,
      due_date: 'No deadline',
      progress: r.progress || 0
    }));

    const stats = statsRows[0] || {};

    res.json({
      continueLearning: continueRows[0] || null,
      recentActivity: activityRows,
      stats: {
        total_completed: stats.total_completed || 0,
        courses_started: stats.courses_started || 0,
        courses_completed: completedCoursesRows[0]?.courses_completed || 0,
        total_seconds: stats.total_seconds || 0
      },
      subjectProgress: subjectRows,
      weeklyActivity,
      streak,
      upcoming
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /user-progress
export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT sub.id as subject_id, sub.title as subject_title,
              COUNT(v.id) as total_videos,
              SUM(CASE WHEN vp.completed = 1 THEN 1 ELSE 0 END) as completed_videos,
              ROUND(SUM(CASE WHEN vp.completed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(v.id), 0) as progress_percentage
       FROM subjects sub
       JOIN sections sec ON sub.id = sec.subject_id
       JOIN videos v ON sec.id = v.section_id
       LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
       GROUP BY sub.id
       ORDER BY sub.display_order`,
      [userId]
    );

    res.json({ progress: rows });
  } catch (error) {
    console.error('User progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /recommendations
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT sub.id as subject_id, sub.title, sub.description,
              ROUND(SUM(CASE WHEN vp.completed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(v.id), 0) as progress,
              MIN(v.title) as sample_video_title,
              MIN(v.youtube_id) as sample_youtube_id
       FROM subjects sub
       JOIN sections sec ON sub.id = sec.subject_id
       JOIN videos v ON sec.id = v.section_id
       LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
       GROUP BY sub.id
       HAVING progress < 100
       ORDER BY progress DESC
       LIMIT 5`,
      [userId]
    );

    res.json({ recommendations: rows });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    // Generate dynamic notifications from progress data
    const [recentRows] = await pool.query<RowDataPacket[]>(
      `SELECT v.title as video_title, sub.title as subject_title, vp.completed
       FROM video_progress vp
       JOIN videos v ON vp.video_id = v.id
       JOIN sections sec ON v.section_id = sec.id
       JOIN subjects sub ON sec.subject_id = sub.id
       WHERE vp.user_id = ?
       ORDER BY vp.last_watched DESC
       LIMIT 4`,
      [userId]
    );

    const notifications = recentRows.map((r: any, i: number) => ({
      id: String(i + 1),
      type: r.completed ? 'completion' : 'progress',
      message: r.completed
        ? `You completed "${r.video_title}"`
        : `Continue watching "${r.video_title}"`,
      metadata: r.subject_title,
      created_at: new Date().toISOString()
    }));

    if (notifications.length === 0) {
      notifications.push({
        id: '1',
        type: 'welcome',
        message: 'Welcome to LMS Platform!',
        metadata: 'Start learning to see your activity here.',
        created_at: new Date().toISOString()
      });
    }

    res.json({ notifications });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /achievements
export const getAchievements = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const [statsRows] = await pool.query<RowDataPacket[]>(
      `SELECT
        COUNT(CASE WHEN vp.completed = 1 THEN 1 END) as total_completed,
        COALESCE(SUM(vp.watched_duration), 0) as total_seconds
       FROM video_progress vp
       WHERE vp.user_id = ?`,
      [userId]
    );

    const stats = statsRows[0] || { total_completed: 0, total_seconds: 0 };
    const totalCompleted = Number(stats.total_completed) || 0;
    const totalSeconds = Number(stats.total_seconds) || 0;

    const xp = totalCompleted * 50 + Math.floor(totalSeconds / 60) * 2;

    let level = 'Beginner';
    let nextLevel = 'Intermediate';
    let progressToNext = 0;

    if (xp >= 2000) { level = 'Expert'; nextLevel = 'Master'; progressToNext = Math.min(100, Math.round((xp - 2000) / 30)); }
    else if (xp >= 1000) { level = 'Advanced'; nextLevel = 'Expert'; progressToNext = Math.round((xp - 1000) / 10); }
    else if (xp >= 500) { level = 'Intermediate'; nextLevel = 'Advanced'; progressToNext = Math.round((xp - 500) / 5); }
    else { progressToNext = Math.round(xp / 5); }

    const badges = [
      { id: 'first_video', title: 'First Watch', unlocked: totalCompleted >= 1 },
      { id: 'five_videos', title: '5 Videos', unlocked: totalCompleted >= 5 },
      { id: 'ten_videos', title: '10 Videos', unlocked: totalCompleted >= 10 },
      { id: 'one_hour', title: '1 Hour', unlocked: totalSeconds >= 3600 },
      { id: 'five_hours', title: '5 Hours', unlocked: totalSeconds >= 18000 },
      { id: 'dedicated', title: 'Dedicated', unlocked: totalCompleted >= 20 }
    ];

    res.json({ xp, level, nextLevel, progressToNext, totalCompleted, totalSeconds, badges, streak: 0 });
  } catch (error) {
    console.error('Achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
