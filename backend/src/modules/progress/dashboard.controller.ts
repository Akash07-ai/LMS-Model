import { Request, Response } from 'express';
import { pool } from '../../config/db';
import { RowDataPacket } from 'mysql2';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    // 1. Per-subject progress
    const [subjectProgress] = await pool.query<RowDataPacket[]>(
      `SELECT
        sub.id, sub.title, sub.display_order,
        COUNT(DISTINCT v.id) as total_videos,
        COUNT(DISTINCT CASE WHEN vp.completed = 1 THEN v.id END) as completed_videos,
        COALESCE(SUM(vp.watched_duration), 0) as total_watched_seconds
       FROM subjects sub
       JOIN sections sec ON sub.id = sec.subject_id
       JOIN videos v ON sec.id = v.section_id
       LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
       GROUP BY sub.id ORDER BY sub.display_order`,
      [userId]
    );

    // 2. Last watched video (continue learning)
    const [lastWatched] = await pool.query<RowDataPacket[]>(
      `SELECT vp.video_id, vp.watched_duration, vp.last_watched,
              v.title as video_title, v.youtube_id, v.duration,
              sec.subject_id, sub.title as subject_title
       FROM video_progress vp
       JOIN videos v ON vp.video_id = v.id
       JOIN sections sec ON v.section_id = sec.id
       JOIN subjects sub ON sec.subject_id = sub.id
       WHERE vp.user_id = ? AND vp.completed = 0
       ORDER BY vp.last_watched DESC LIMIT 1`,
      [userId]
    );

    // 3. Recent activity (last 5 items)
    const [recentActivity] = await pool.query<RowDataPacket[]>(
      `SELECT v.title as video_title, sub.title as subject_title,
              vp.last_watched, vp.completed
       FROM video_progress vp
       JOIN videos v ON vp.video_id = v.id
       JOIN sections sec ON v.section_id = sec.id
       JOIN subjects sub ON sec.subject_id = sub.id
       WHERE vp.user_id = ?
       ORDER BY vp.last_watched DESC LIMIT 5`,
      [userId]
    );

    // 4. Stats
    const [stats] = await pool.query<RowDataPacket[]>(
      `SELECT
        COUNT(DISTINCT CASE WHEN vp.completed = 1 THEN v.id END) as total_completed,
        COUNT(DISTINCT CASE WHEN vp.video_id IS NOT NULL THEN sec.subject_id END) as courses_started,
        COUNT(DISTINCT CASE WHEN sub_done.subject_id IS NOT NULL THEN sub_done.subject_id END) as courses_completed,
        COALESCE(SUM(vp.watched_duration), 0) as total_seconds
       FROM subjects sub
       JOIN sections sec ON sub.id = sec.subject_id
       JOIN videos v ON sec.id = v.section_id
       LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
       LEFT JOIN (
         SELECT sec2.subject_id
         FROM videos v2
         JOIN sections sec2 ON v2.section_id = sec2.id
         LEFT JOIN video_progress vp2 ON v2.id = vp2.video_id AND vp2.user_id = ?
         GROUP BY sec2.subject_id
         HAVING COUNT(v2.id) = COUNT(CASE WHEN vp2.completed = 1 THEN 1 END)
       ) sub_done ON sub.id = sub_done.subject_id`,
      [userId, userId]
    );

    // 5. Weekly activity (last 7 days seconds watched per day)
    const [weeklyActivity] = await pool.query<RowDataPacket[]>(
      `SELECT
        DATE(last_watched) as day,
        SUM(watched_duration) as seconds
       FROM video_progress
       WHERE user_id = ? AND last_watched >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(last_watched)
       ORDER BY day ASC`,
      [userId]
    );

    const days: { day: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en', { weekday: 'short' });
      const found = weeklyActivity.find((r: any) => r.day?.toISOString?.().split('T')[0] === key || String(r.day) === key);
      days.push({ day: label, minutes: found ? Math.round(Number(found.seconds) / 60) : 0 });
    }

    // 6. Streak (consecutive active days)
    const [activityDays] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT DATE(last_watched) as day
       FROM video_progress WHERE user_id = ?
       ORDER BY day DESC LIMIT 30`,
      [userId]
    );
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < activityDays.length; i++) {
      const d = new Date(activityDays[i].day);
      d.setHours(0, 0, 0, 0);
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      if (d.getTime() === expected.getTime()) streak++;
      else break;
    }

    // 7. Upcoming schedule
    const [pendingLessons] = await pool.query<RowDataPacket[]>(
      `SELECT v.id as video_id, v.title as video_title, sec.subject_id, sub.title as subject_title,
              vp.watched_duration, v.duration
       FROM videos v
       JOIN sections sec ON v.section_id = sec.id
       JOIN subjects sub ON sec.subject_id = sub.id
       LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
       WHERE vp.completed = 0 OR vp.completed IS NULL
       ORDER BY vp.last_watched DESC, v.id ASC
       LIMIT 4`,
      [userId]
    );

    const upcoming = (pendingLessons as any[]).map((item, index) => ({
      video_id: item.video_id,
      title: item.video_title,
      subject: item.subject_title,
      due_date: new Date(Date.now() + (index + 1) * 86400000).toISOString().split('T')[0],
      progress: item.duration ? Math.round((item.watched_duration || 0) / item.duration * 100) : 0,
    }));

    res.json({
      subjectProgress,
      continueLearning: lastWatched[0] || null,
      recentActivity,
      stats: stats[0] || {},
      weeklyActivity: days,
      streak,
      upcoming,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const [recommendations] = await pool.query<RowDataPacket[]>(
      `SELECT
        sub.id as subject_id,
        sub.title as subject_title,
        sub.description,
        COUNT(v.id) as total_videos,
        COUNT(CASE WHEN vp.completed = 1 THEN 1 END) as completed_videos,
        COUNT(CASE WHEN vp.video_id IS NOT NULL THEN 1 END) as started_videos,
        MIN(v.youtube_id) as sample_youtube_id,
        MIN(v.title) as sample_video_title
       FROM subjects sub
       JOIN sections sec ON sub.id = sec.subject_id
       JOIN videos v ON sec.id = v.section_id
       LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
       GROUP BY sub.id
       ORDER BY completed_videos ASC, started_videos DESC, total_videos DESC
       LIMIT 6`,
      [userId]
    );

    res.json({
      recommendations: (recommendations as any[]).map((item) => ({
        subject_id: item.subject_id,
        title: item.subject_title,
        description: item.description || 'Recommended course based on your learning path.',
        progress: item.total_videos ? Math.round((item.completed_videos / item.total_videos) * 100) : 0,
        sample_video_title: item.sample_video_title,
        sample_youtube_id: item.sample_youtube_id,
      })),
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const [continueRes] = await pool.query<RowDataPacket[]>(
      `SELECT v.title as video_title, sub.title as subject_title, vp.last_watched
       FROM video_progress vp
       JOIN videos v ON vp.video_id = v.id
       JOIN sections sec ON v.section_id = sec.id
       JOIN subjects sub ON sec.subject_id = sub.id
       WHERE vp.user_id = ? AND vp.completed = 0
       ORDER BY vp.last_watched DESC LIMIT 1`,
      [userId]
    );

    const [stats] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT CASE WHEN completed = 0 THEN video_id END) as open_lessons,
              COUNT(DISTINCT CASE WHEN completed = 1 THEN video_id END) as completed_lessons
       FROM video_progress WHERE user_id = ?`,
      [userId]
    );

    const openLessons = stats[0]?.open_lessons || 0;
    const completedLessons = stats[0]?.completed_lessons || 0;
    const notifications: any[] = [];

    if (continueRes[0]) {
      notifications.push({
        id: 'resume-course',
        type: 'action',
        message: `Resume “${continueRes[0].video_title}” in ${continueRes[0].subject_title}`,
        metadata: 'Continue where you left off',
        created_at: new Date().toISOString(),
      });
    }

    if (openLessons > 0) {
      notifications.push({
        id: 'pending-lessons',
        type: 'reminder',
        message: `You have ${openLessons} pending lesson${openLessons === 1 ? '' : 's'}`,
        metadata: 'Keep your learning streak going',
        created_at: new Date().toISOString(),
      });
    }

    notifications.push(
      {
        id: 'new-courses',
        type: 'update',
        message: 'New courses added in your learning areas.',
        metadata: 'Check the latest content',
        created_at: new Date().toISOString(),
      },
      {
        id: 'achievement-alert',
        type: 'achievement',
        message: `${completedLessons} lessons completed this week`,
        metadata: 'Great progress!',
        created_at: new Date().toISOString(),
      }
    );

    res.json({ notifications });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAchievements = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const [stats] = await pool.query<RowDataPacket[]>(
      `SELECT
        COUNT(DISTINCT CASE WHEN completed = 1 THEN video_id END) as total_completed,
        COALESCE(SUM(watched_duration), 0) as total_seconds
       FROM video_progress WHERE user_id = ?`,
      [userId]
    );

    const [activityDays] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT DATE(last_watched) as day
       FROM video_progress WHERE user_id = ?
       ORDER BY day DESC LIMIT 30`,
      [userId]
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < activityDays.length; i++) {
      const d = new Date(activityDays[i].day);
      d.setHours(0, 0, 0, 0);
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      if (d.getTime() === expected.getTime()) streak++;
      else break;
    }

    const totalCompleted = Number(stats[0]?.total_completed || 0);
    const totalSeconds = Number(stats[0]?.total_seconds || 0);
    const xp = totalCompleted * 80 + streak * 20 + Math.min(120, Math.floor(totalSeconds / 60));
    const level = xp >= 1000 ? 'Pro' : xp >= 500 ? 'Advanced' : xp >= 250 ? 'Learner' : 'Beginner';
    const nextLevel = level === 'Pro' ? 'Pro' : level === 'Advanced' ? 'Pro' : level === 'Learner' ? 'Advanced' : 'Learner';
    const nextLevelXp = level === 'Pro' ? xp : level === 'Advanced' ? 1000 : level === 'Learner' ? 500 : 250;
    const progressToNext = level === 'Pro' ? 100 : Math.min(100, Math.round((xp / nextLevelXp) * 100));

    const badges = [
      {
        id: 'first-course',
        title: 'First Course Completed',
        unlocked: totalCompleted >= 1,
      },
      {
        id: '7-day-streak',
        title: '7-Day Streak',
        unlocked: streak >= 7,
      },
      {
        id: 'fast-learner',
        title: 'Fast Learner',
        unlocked: totalSeconds >= 3600,
      },
    ];

    res.json({
      xp,
      level,
      streak,
      totalCompleted,
      totalSeconds,
      nextLevel,
      progressToNext,
      badges,
    });
  } catch (error) {
    console.error('Achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
