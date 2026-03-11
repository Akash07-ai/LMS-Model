import { Request, Response } from 'express';
import { pool } from '../../config/db';
import { RowDataPacket } from 'mysql2';

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { watchedDuration, completed } = req.body;
    const userId = req.userId!;

    console.log(`[PROGRESS] Updating progress for user ${userId}, video ${videoId}, duration: ${watchedDuration}, completed: ${completed}`);

    // Validate input
    if (watchedDuration === undefined || watchedDuration === null) {
      console.error('[PROGRESS] watchedDuration is required but not provided');
      return res.status(400).json({ message: 'watchedDuration is required' });
    }

    if (!videoId || isNaN(Number(videoId))) {
      console.error('[PROGRESS] Invalid videoId:', videoId);
      return res.status(400).json({ message: 'Invalid video ID' });
    }

    if (!userId || isNaN(Number(userId))) {
      console.error('[PROGRESS] Invalid userId:', userId);
      return res.status(401).json({ message: 'Invalid user session' });
    }

    // Get video duration to cap progress
    const [videos] = await pool.query<RowDataPacket[]>(
      'SELECT duration FROM videos WHERE id = ?',
      [Number(videoId)]
    );

    if (videos.length === 0) {
      console.error('[PROGRESS] Video not found with id:', videoId);
      return res.status(404).json({ message: 'Video not found' });
    }

    const videoDuration = videos[0].duration;
    
    // Cap watched duration to video duration
    const cappedDuration = Math.min(watchedDuration, videoDuration);
    
    // Auto-complete if watched >= 95% of video
    const autoComplete = cappedDuration >= videoDuration * 0.95;
    const isCompleted = completed || autoComplete;

    console.log(`[PROGRESS] Video found. Duration: ${videoDuration}, Capped: ${cappedDuration}, Auto-complete: ${autoComplete}, Final completed: ${isCompleted}`);

    // Check if progress exists
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM video_progress WHERE user_id = ? AND video_id = ?',
      [Number(userId), Number(videoId)]
    );

    if (existing.length > 0) {
      // Update existing progress
      console.log(`[PROGRESS] Updating existing progress record`);
      const result = await pool.query(
        `UPDATE video_progress 
         SET watched_duration = ?, completed = ?, last_watched = NOW()
         WHERE user_id = ? AND video_id = ?`,
        [cappedDuration, isCompleted ? 1 : 0, Number(userId), Number(videoId)]
      );
      console.log(`[PROGRESS] Update result:`, result);
    } else {
      // Insert new progress
      console.log(`[PROGRESS] Inserting new progress record`);
      const result = await pool.query(
        `INSERT INTO video_progress (user_id, video_id, watched_duration, completed)
         VALUES (?, ?, ?, ?)`,
        [Number(userId), Number(videoId), cappedDuration, isCompleted ? 1 : 0]
      );
      console.log(`[PROGRESS] Insert result:`, result);
    }

    console.log(`[PROGRESS] Successfully updated progress for user ${userId}, video ${videoId}`);

    res.json({ 
      message: 'Progress updated successfully',
      progress: {
        watched_duration: cappedDuration,
        completed: isCompleted,
        percentage: Math.round((cappedDuration / videoDuration) * 100)
      }
    });
  } catch (error) {
    console.error('[PROGRESS] Update progress error:', error);
    console.error('[PROGRESS] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getProgress = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const userId = req.userId!;

    const [progress] = await pool.query<RowDataPacket[]>(
      `SELECT 
        vp.*,
        v.duration as total_duration,
        v.title as video_title
      FROM video_progress vp
      JOIN videos v ON vp.video_id = v.id
      WHERE vp.user_id = ? AND vp.video_id = ?`,
      [userId, videoId]
    );

    if (progress.length === 0) {
      return res.json({ progress: null });
    }

    res.json({ progress: progress[0] });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const [progress] = await pool.query<RowDataPacket[]>(
      `SELECT 
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
      ORDER BY sub.display_order`,
      [userId]
    );

    res.json({ progress });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
