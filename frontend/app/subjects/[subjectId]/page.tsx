'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/apiClient';

interface Video {
  id: number;
  title: string;
  youtube_id: string;
  duration: number;
  order_index: number;
  locked: boolean;
  is_completed: boolean;
  watched_duration: number;
}

interface Section {
  id: number;
  title: string;
  display_order: number;
  videos: Video[];
}

interface Subject {
  id: number;
  title: string;
  description: string;
}

export default function SubjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const user = useAuthStore((state) => state.user);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  // ── all original logic untouched ──────────────────────────────────────────
  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    fetchSubjectData();
  }, [user, params.subjectId]);

  const fetchSubjectData = async () => {
    try {
      const { data } = await apiClient.get(`/subjects/${params.subjectId}/tree`);
      setSubject(data);
      setSections(data.sections);
    } catch (error) {
      console.error('Failed to fetch subject:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (videoId: number, isLocked: boolean) => {
    if (isLocked) { alert('Complete previous videos to unlock this one'); return; }
    router.push(`/subjects/${params.subjectId}/video/${videoId}`);
  };
  // ─────────────────────────────────────────────────────────────────────────

  const formatDuration = (duration: number) => {
    const h = Math.floor(duration / 3600);
    const m = Math.floor((duration % 3600) / 60);
    const s = duration % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${m}:${String(s).padStart(2, '0')}`;
  };

  if (!user || loading) return (
    <div className="flex h-screen items-center justify-center" style={{ background: '#080810' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading course...</p>
      </div>
    </div>
  );

  const totalVideos = sections.reduce((a, s) => a + s.videos.length, 0);
  const completedVideos = sections.reduce((a, s) => a + s.videos.filter(v => v.is_completed).length, 0);
  const overallProgress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .nav-glass {
          background: rgba(10,10,20,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .section-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .video-row {
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.2s ease;
        }
        .video-row:hover:not(.locked) {
          background: rgba(255,255,255,0.05);
          border-color: rgba(139,92,246,0.3);
          transform: translateX(2px);
        }
        .video-row.locked { cursor: not-allowed; opacity: 0.5; }
        .progress-fill {
          background: linear-gradient(90deg,#3b82f6,#8b5cf6);
          transition: width 0.6s ease;
        }
      `}</style>

      <div className="min-h-screen" style={{ background: '#080810' }}>

        {/* ── Navbar ─────────────────────────────────────────────────────── */}
        <nav className="nav-glass sticky top-0 z-50 px-6 py-3.5 flex items-center gap-4">
          <button onClick={() => router.push('/subjects')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            All Courses
          </button>
          <span className="text-gray-700">·</span>
          {subject && <span className="text-gray-400 text-sm truncate">{subject.title}</span>}
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-10">

          {/* ── Course Header ───────────────────────────────────────────── */}
          {subject && (
            <div className="fade-up mb-8 p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-1.5">{subject.title}</h1>
                  <p className="text-gray-500 text-sm leading-relaxed">{subject.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-white">{overallProgress}%</p>
                  <p className="text-gray-500 text-xs">{completedVideos}/{totalVideos} completed</p>
                </div>
              </div>

              {/* Overall progress bar */}
              <div className="mt-4">
                <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="progress-fill h-1.5 rounded-full" style={{ width: `${overallProgress}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* ── Sections ────────────────────────────────────────────────── */}
          <div className="space-y-4">
            {sections.map((section, si) => {
              const sCompleted = section.videos.filter(v => v.is_completed).length;
              const sTotal = section.videos.length;

              return (
                <div key={section.id} className="section-card rounded-2xl overflow-hidden fade-up"
                  style={{ animationDelay: `${si * 0.08}s` }}>

                  {/* Section header */}
                  <div className="px-5 py-4 flex items-center justify-between"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
                        {si + 1}
                      </div>
                      <h2 className="text-white font-semibold text-sm">{section.title}</h2>
                    </div>
                    <span className="text-xs text-gray-500">{sCompleted}/{sTotal} done</span>
                  </div>

                  {/* Videos */}
                  <div className="p-3 space-y-2">
                    {section.videos.map((video) => {
                      const progress = video.watched_duration && video.duration
                        ? Math.round((video.watched_duration / video.duration) * 100)
                        : 0;

                      return (
                        <div key={video.id}
                          onClick={() => handleVideoClick(video.id, video.locked)}
                          className={`video-row rounded-xl p-3.5 cursor-pointer ${video.locked ? 'locked' : ''}`}
                          style={{ background: 'rgba(255,255,255,0.02)' }}>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Status icon */}
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${
                                video.locked
                                  ? 'bg-gray-800 text-gray-600'
                                  : video.is_completed
                                  ? 'text-white'
                                  : 'bg-blue-500/10 text-blue-400'
                              }`}
                                style={video.is_completed ? { background: 'linear-gradient(135deg,#10b981,#3b82f6)' } : {}}>
                                {video.locked ? '🔒' : video.is_completed ? '✓' : '▶'}
                              </div>

                              <div className="min-w-0">
                                <p className={`text-sm font-medium leading-snug truncate ${video.locked ? 'text-gray-600' : 'text-gray-200'}`}>
                                  {video.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5 font-mono">{formatDuration(video.duration)}</p>
                              </div>
                            </div>

                            {/* Progress % */}
                            {!video.locked && progress > 0 && (
                              <span className={`text-xs font-semibold flex-shrink-0 ${video.is_completed ? 'text-emerald-400' : 'text-blue-400'}`}>
                                {progress}%
                              </span>
                            )}
                          </div>

                          {/* Progress bar */}
                          {!video.locked && progress > 0 && progress < 100 && (
                            <div className="mt-2.5 ml-10">
                              <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                                <div className="progress-fill h-1 rounded-full" style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
