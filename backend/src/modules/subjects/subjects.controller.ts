import { Request, Response } from 'express';
import { pool } from '../../config/db';
import { RowDataPacket } from 'mysql2';

export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const [subjects] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM subjects ORDER BY display_order'
    );

    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSubjectTree = async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;
    const userId = req.userId!;

    // Get subject
    const [subjects] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM subjects WHERE id = ?',
      [subjectId]
    );

    if (subjects.length === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Get all sections with videos
    const [sections] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM sections WHERE subject_id = ? ORDER BY display_order',
      [subjectId]
    );

    // Get all videos with progress for this subject
    const [allVideos] = await pool.query<RowDataPacket[]>(
      `SELECT 
        v.id,
        v.section_id,
        v.title,
        v.youtube_id,
        v.duration,
        v.concept,
        v.display_order as order_index,
        sec.display_order as section_order,
        COALESCE(vp.completed, 0) as is_completed,
        COALESCE(vp.watched_duration, 0) as watched_duration
      FROM videos v
      JOIN sections sec ON v.section_id = sec.id
      LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
      WHERE sec.subject_id = ?
      ORDER BY sec.display_order, v.display_order`,
      [userId, subjectId]
    );

    // Build tree with locking logic
    let previousVideoCompleted = true;
    const sectionsWithVideos = sections.map((section) => {
      const sectionVideos = allVideos.filter(v => v.section_id === section.id);
      
      const videosWithLock = sectionVideos.map((video) => {
        const locked = !previousVideoCompleted;
        previousVideoCompleted = video.is_completed === 1;
        
        return {
          id: video.id,
          title: video.title,
          youtube_id: video.youtube_id,
          duration: video.duration,
          concept: video.concept,
          order_index: video.order_index,
          locked,
          is_completed: video.is_completed === 1,
          watched_duration: video.watched_duration
        };
      });

      return {
        id: section.id,
        title: section.title,
        display_order: section.display_order,
        videos: videosWithLock
      };
    });

    res.json({
      id: subjects[0].id,
      title: subjects[0].title,
      description: subjects[0].description,
      sections: sectionsWithVideos
    });
  } catch (error) {
    console.error('Get subject tree error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSubjectWithSections = async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;
    const userId = req.userId!;

    const [subjects] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM subjects WHERE id = ?',
      [subjectId]
    );

    if (subjects.length === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const [sections] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM sections WHERE subject_id = ? ORDER BY display_order',
      [subjectId]
    );

    const sectionsWithVideos = await Promise.all(
      sections.map(async (section) => {
        const [videos] = await pool.query<RowDataPacket[]>(
          `SELECT 
            v.*,
            vp.watched_duration,
            vp.completed,
            vp.last_watched
          FROM videos v
          LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
          WHERE v.section_id = ?
          ORDER BY v.display_order`,
          [userId, section.id]
        );

        return {
          ...section,
          videos
        };
      })
    );

    res.json({
      subject: subjects[0],
      sections: sectionsWithVideos
    });
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getNextUnlockedVideo = async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;
    const userId = req.userId!;

    // Get all videos for this subject in order
    const [videos] = await pool.query<RowDataPacket[]>(
      `SELECT 
        v.id,
        v.title,
        v.youtube_id,
        v.duration,
        v.display_order,
        sec.id as section_id,
        sec.title as section_title,
        sec.display_order as section_order,
        vp.completed
      FROM videos v
      JOIN sections sec ON v.section_id = sec.id
      LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
      WHERE sec.subject_id = ?
      ORDER BY sec.display_order, v.display_order`,
      [userId, subjectId]
    );

    if (videos.length === 0) {
      return res.status(404).json({ message: 'No videos found' });
    }

    // Find first incomplete video (sequential unlocking)
    const nextVideo = videos.find(v => !v.completed) || videos[0];

    res.json({ video: nextVideo });
  } catch (error) {
    console.error('Get next video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFirstVideo = async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;

    // Get first video of subject
    const [videos] = await pool.query<RowDataPacket[]>(
      `SELECT 
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
      LIMIT 1`,
      [subjectId]
    );

    if (videos.length === 0) {
      return res.status(404).json({ message: 'No videos found for this subject' });
    }

    res.json({ video: videos[0] });
  } catch (error) {
    console.error('Get first video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
