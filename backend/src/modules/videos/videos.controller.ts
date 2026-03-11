import { Request, Response } from 'express';
import { pool } from '../../config/db';
import { RowDataPacket } from 'mysql2';

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const userId = req.userId!;

    // Get video details
    const [videos] = await pool.query<RowDataPacket[]>(
      `SELECT 
        v.*,
        sec.title as section_title,
        sec.subject_id,
        sec.display_order as section_order,
        sub.title as subject_title,
        vp.watched_duration,
        vp.completed,
        vp.last_watched
      FROM videos v
      JOIN sections sec ON v.section_id = sec.id
      JOIN subjects sub ON sec.subject_id = sub.id
      LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
      WHERE v.id = ?`,
      [userId, videoId]
    );

    if (videos.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const video = videos[0];

    // Check if video is unlocked
    const isUnlocked = await checkVideoUnlocked(userId, video.id, video.subject_id);

    if (!isUnlocked) {
      return res.status(403).json({ 
        message: 'Video is locked. Complete previous videos first.',
        locked: true
      });
    }

    // Get previous video
    const [prevVideos] = await pool.query<RowDataPacket[]>(
      `SELECT v.id, v.title
       FROM videos v
       JOIN sections sec ON v.section_id = sec.id
       WHERE sec.subject_id = ?
       AND (
         (sec.display_order = ? AND v.display_order < ?)
         OR sec.display_order < ?
       )
       ORDER BY sec.display_order DESC, v.display_order DESC
       LIMIT 1`,
      [video.subject_id, video.section_order, video.display_order, video.section_order]
    );

    // Get next video
    const [nextVideos] = await pool.query<RowDataPacket[]>(
      `SELECT v.id, v.title
       FROM videos v
       JOIN sections sec ON v.section_id = sec.id
       WHERE sec.subject_id = ?
       AND (
         (sec.display_order = ? AND v.display_order > ?)
         OR sec.display_order > ?
       )
       ORDER BY sec.display_order ASC, v.display_order ASC
       LIMIT 1`,
      [video.subject_id, video.section_order, video.display_order, video.section_order]
    );

    res.json({
      id: video.id,
      title: video.title,
      description: video.section_title,
      concept: video.concept,
      youtube_url: `https://www.youtube.com/watch?v=${video.youtube_id}`,
      youtube_id: video.youtube_id,
      duration: video.duration,
      subject_id: video.subject_id,
      subject_title: video.subject_title,
      section_title: video.section_title,
      watched_duration: video.watched_duration || 0,
      completed: video.completed || false,
      locked: false,
      previous_video_id: prevVideos.length > 0 ? prevVideos[0].id : null,
      next_video_id: nextVideos.length > 0 ? nextVideos[0].id : null
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getNextVideo = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const userId = req.userId!;

    // Get current video info
    const [currentVideos] = await pool.query<RowDataPacket[]>(
      `SELECT v.*, sec.subject_id, sec.display_order as section_order
       FROM videos v
       JOIN sections sec ON v.section_id = sec.id
       WHERE v.id = ?`,
      [videoId]
    );

    if (currentVideos.length === 0) {
      return res.status(404).json({ message: 'Current video not found' });
    }

    const current = currentVideos[0];

    // Get next video in sequence
    const [nextVideos] = await pool.query<RowDataPacket[]>(
      `SELECT 
        v.id,
        v.title,
        v.youtube_id,
        v.duration,
        sec.title as section_title
      FROM videos v
      JOIN sections sec ON v.section_id = sec.id
      WHERE sec.subject_id = ?
      AND (
        (sec.display_order = ? AND v.display_order > ?)
        OR sec.display_order > ?
      )
      ORDER BY sec.display_order, v.display_order
      LIMIT 1`,
      [current.subject_id, current.section_order, current.display_order, current.section_order]
    );

    if (nextVideos.length === 0) {
      return res.json({ video: null, message: 'No more videos' });
    }

    res.json({ video: nextVideos[0] });
  } catch (error) {
    console.error('Get next video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPreviousVideo = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    // Get current video info
    const [currentVideos] = await pool.query<RowDataPacket[]>(
      `SELECT v.*, sec.subject_id, sec.display_order as section_order
       FROM videos v
       JOIN sections sec ON v.section_id = sec.id
       WHERE v.id = ?`,
      [videoId]
    );

    if (currentVideos.length === 0) {
      return res.status(404).json({ message: 'Current video not found' });
    }

    const current = currentVideos[0];

    // Get previous video in sequence
    const [prevVideos] = await pool.query<RowDataPacket[]>(
      `SELECT 
        v.id,
        v.title,
        v.youtube_id,
        v.duration,
        sec.title as section_title
      FROM videos v
      JOIN sections sec ON v.section_id = sec.id
      WHERE sec.subject_id = ?
      AND (
        (sec.display_order = ? AND v.display_order < ?)
        OR sec.display_order < ?
      )
      ORDER BY sec.display_order DESC, v.display_order DESC
      LIMIT 1`,
      [current.subject_id, current.section_order, current.display_order, current.section_order]
    );

    if (prevVideos.length === 0) {
      return res.json({ video: null, message: 'No previous video' });
    }

    res.json({ video: prevVideos[0] });
  } catch (error) {
    console.error('Get previous video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

async function checkVideoUnlocked(userId: number, videoId: number, subjectId: number): Promise<boolean> {
  // Get all videos before this one
  const [previousVideos] = await pool.query<RowDataPacket[]>(
    `SELECT 
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
    ORDER BY sec.display_order, v.display_order`,
    [userId, subjectId, videoId, videoId, videoId]
  );

  // If no previous videos, this is the first video (unlocked)
  if (previousVideos.length === 0) {
    return true;
  }

  // Check if all previous videos are completed
  return previousVideos.every(v => v.completed === 1);
}
