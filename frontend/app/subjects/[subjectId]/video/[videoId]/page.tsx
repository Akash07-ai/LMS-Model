'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/apiClient';

interface Video {
  id: number;
  title: string;
  youtube_id: string;
  duration: number;
  concept?: string;
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
  sections: Section[];
}

interface CurrentVideo {
  id: number;
  title: string;
  youtube_id: string;
  duration: number;
  concept?: string;
  section_title: string;
  subject_title: string;
  subject_id: number;
  watched_duration: number;
  completed: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const COMPLETION_THRESHOLD = 0.9;
const PROGRESS_SAVE_INTERVAL = 5000;

export default function VideoPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const user = useAuthStore((state) => state.user);

  const [currentVideo, setCurrentVideo] = useState<CurrentVideo | null>(null);
  const [subjectTree, setSubjectTree] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  // Progress tracking
  const [watchedPercent, setWatchedPercent] = useState(0);
  const [realDuration, setRealDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [canComplete, setCanComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const [videoError, setVideoError] = useState(false);

  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);
  const uiIntervalRef = useRef<any>(null);
  const autoAdvanceRef = useRef<any>(null);
  const watchedPercentRef = useRef(0);
  const maxWatchedRef = useRef(0); // tracks highest % reached (skip detection)

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    fetchData();
    loadYouTubeAPI();
    return () => {
      clearInterval(progressIntervalRef.current);
      clearInterval(uiIntervalRef.current);
      clearInterval(autoAdvanceRef.current);
    };
  }, [user, params.videoId]);

  const fetchData = async () => {
    setLoading(true);
    setWatchedPercent(0);
    setCurrentTime(0);
    setRealDuration(0);
    setCanComplete(false);
    setJustCompleted(false);
    setVideoError(false);
    watchedPercentRef.current = 0;
    maxWatchedRef.current = 0;

    try {
      const [videoRes, treeRes] = await Promise.all([
        apiClient.get(`/videos/${params.videoId}`),
        apiClient.get(`/subjects/${params.subjectId}/tree`)
      ]);
      setCurrentVideo(videoRes.data);
      setSubjectTree(treeRes.data);

      if (videoRes.data.completed) {
        setCanComplete(true);
        setWatchedPercent(100);
        watchedPercentRef.current = 100;
        maxWatchedRef.current = 100;
      }

      setLoading(false);
      setTimeout(() => initializePlayer(videoRes.data), 800);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      if (error.response?.status === 403) {
        alert('This video is locked. Complete previous videos first.');
        router.push(`/subjects/${params.subjectId}`);
      }
    }
  };

  const loadYouTubeAPI = () => {
    if (typeof window === 'undefined') return;
    if (window.YT?.Player) return;
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) return;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  };

  const initializePlayer = (videoData: CurrentVideo) => {
    // Destroy existing player if any
    if (playerRef.current?.destroy) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    const create = () => {
      if (!window.YT?.Player) return;
      const startAt = Math.floor(videoData.watched_duration || 0);
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoData.youtube_id,
        playerVars: {
          autoplay: 1,
          start: startAt,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event: any) => {
            setVideoError(false);
            const dur = Math.floor(event.target.getDuration());
            setRealDuration(dur);

            if (videoData.watched_duration && dur > 0) {
              const pct = Math.min((videoData.watched_duration / dur) * 100, 100);
              setWatchedPercent(pct);
              watchedPercentRef.current = pct;
              maxWatchedRef.current = pct;
              if (pct >= COMPLETION_THRESHOLD * 100 || videoData.completed) {
                setCanComplete(true);
              }
            }
          },
          onStateChange: onPlayerStateChange,
          onError: (e: any) => {
            console.error('[PLAYER] Error:', e.data);
            // 100=video not found, 101/150=embedding disabled
            if ([100, 101, 150].includes(e.data)) {
              setVideoError(true);
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      create();
    } else {
      window.onYouTubeIframeAPIReady = create;
    }
  };

  const onPlayerStateChange = (event: any) => {
    const YT = window.YT.PlayerState;
    if (event.data === YT.PLAYING) {
      setIsPlaying(true);
      startUITracking();
      startProgressTracking();
    } else if (event.data === YT.ENDED) {
      setIsPlaying(false);
      stopUITracking();
      stopProgressTracking();
      handleVideoEnded();
    } else if (event.data === YT.PAUSED) {
      setIsPlaying(false);
      stopUITracking();
      stopProgressTracking();
      saveProgress(false);
    }
  };

  const startUITracking = () => {
    if (uiIntervalRef.current) return;
    uiIntervalRef.current = setInterval(() => {
      if (!playerRef.current?.getCurrentTime) return;
      try {
        const ct = Math.floor(playerRef.current.getCurrentTime());
        const dur = Math.floor(playerRef.current.getDuration());
        if (dur <= 0) return;

        const pct = Math.min((ct / dur) * 100, 100);
        setCurrentTime(ct);
        setRealDuration(dur);
        watchedPercentRef.current = pct;

        // Skip detection: only update maxWatched if progressing naturally
        // Allow small seeks (±10s) but block large forward jumps
        const prevMax = maxWatchedRef.current;
        const prevPct = watchedPercentRef.current;
        const jumped = pct - prevMax > 5; // jumped more than 5% ahead of max

        if (!jumped) {
          maxWatchedRef.current = Math.max(maxWatchedRef.current, pct);
        }

        setWatchedPercent(maxWatchedRef.current);

        if (maxWatchedRef.current >= COMPLETION_THRESHOLD * 100) {
          setCanComplete(true);
        }
      } catch (e) {}
    }, 1000);
  };

  const stopUITracking = () => {
    clearInterval(uiIntervalRef.current);
    uiIntervalRef.current = null;
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) return;
    progressIntervalRef.current = setInterval(() => saveProgress(false), PROGRESS_SAVE_INTERVAL);
  };

  const stopProgressTracking = () => {
    clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = null;
  };

  const saveProgress = useCallback(async (completed: boolean) => {
    if (!playerRef.current?.getCurrentTime || !currentVideo) return;
    try {
      const ct = Math.floor(playerRef.current.getCurrentTime());
      await apiClient.post(`/progress/${currentVideo.id}`, {
        watchedDuration: ct,
        completed,
      });
    } catch (e) {}
  }, [currentVideo]);

  const handleVideoEnded = async () => {
    maxWatchedRef.current = 100;
    setWatchedPercent(100);
    setCanComplete(true);
    await saveProgress(false);
    startAutoAdvanceCountdown();
  };

  const startAutoAdvanceCountdown = () => {
    setAutoAdvanceCountdown(5);
    let count = 5;
    autoAdvanceRef.current = setInterval(() => {
      count -= 1;
      setAutoAdvanceCountdown(count);
      if (count <= 0) {
        clearInterval(autoAdvanceRef.current);
        setAutoAdvanceCountdown(null);
        handleMarkComplete(true);
      }
    }, 1000);
  };

  const cancelAutoAdvance = () => {
    clearInterval(autoAdvanceRef.current);
    setAutoAdvanceCountdown(null);
  };

  const handleMarkComplete = async (auto = false) => {
    if (!currentVideo) return;
    if (!auto && !canComplete) return;
    setMarkingComplete(true);
    cancelAutoAdvance();

    try {
      await apiClient.post(`/progress/${currentVideo.id}/complete`, {});
      setCurrentVideo(prev => prev ? { ...prev, completed: true } : null);
      setJustCompleted(true);

      // Refresh sidebar
      const treeRes = await apiClient.get(`/subjects/${params.subjectId}/tree`);
      setSubjectTree(treeRes.data);

      await new Promise(r => setTimeout(r, 600));

      const nextRes = await apiClient.get(`/videos/${currentVideo.id}/next`);
      if (nextRes.data.video) {
        const next = nextRes.data.video;
        if (auto) {
          router.push(`/subjects/${params.subjectId}/video/${next.id}`);
        } else {
          const go = confirm(`✓ Completed! Play next: "${next.title}"?`);
          if (go) router.push(`/subjects/${params.subjectId}/video/${next.id}`);
        }
      } else {
        alert('🎉 You completed all videos in this subject!');
        router.push(`/subjects/${params.subjectId}`);
      }
    } catch (error: any) {
      alert(`Failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleVideoClick = (videoId: number, locked: boolean) => {
    if (locked) { alert('Complete previous videos to unlock this one.'); return; }
    if (videoId === parseInt(params.videoId as string)) return;
    stopUITracking();
    stopProgressTracking();
    router.push(`/subjects/${params.subjectId}/video/${videoId}`);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  if (!user || loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading lesson...</p>
      </div>
    </div>
  );

  if (!currentVideo) return (
    <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
      Video not found
    </div>
  );

  const progressPercent = Math.round(watchedPercent);
  const thresholdPercent = Math.round(COMPLETION_THRESHOLD * 100);
  const remaining = Math.max(thresholdPercent - progressPercent, 0);
  const isCompleted = currentVideo.completed || justCompleted;

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">

      {/* ── Sidebar ── */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-gray-900 border-r border-gray-800 overflow-y-auto flex-shrink-0`}>
        {sidebarOpen && subjectTree && (
          <div className="p-4">
            <button
              onClick={() => router.push(`/subjects/${params.subjectId}`)}
              className="text-blue-400 hover:text-blue-300 text-xs mb-3 flex items-center gap-1"
            >
              ← Back to Course
            </button>
            <h2 className="text-sm font-bold text-white mb-4 leading-tight">{subjectTree.title}</h2>

            {subjectTree.sections.map(section => (
              <div key={section.id} className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.videos.map((video) => {
                    const isActive = video.id === parseInt(params.videoId as string);
                    const vPct = video.duration > 0
                      ? Math.min(Math.round((video.watched_duration / video.duration) * 100), 100)
                      : 0;

                    return (
                      <div
                        key={video.id}
                        onClick={() => handleVideoClick(video.id, video.locked)}
                        className={`p-2.5 rounded-lg text-xs cursor-pointer transition-all ${
                          isActive
                            ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                            : video.locked
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'hover:bg-gray-800 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base flex-shrink-0">
                            {video.locked ? '🔒' : video.is_completed ? '✅' : isActive ? '▶' : '○'}
                          </span>
                          <span className="flex-1 leading-tight">{video.title}</span>
                        </div>

                        {/* Per-video progress bar in sidebar */}
                        {!video.locked && !video.is_completed && vPct > 0 && (
                          <div className="mt-1.5 ml-6">
                            <div className="w-full bg-gray-700 rounded-full h-1">
                              <div
                                className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                                style={{ width: `${vPct}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white text-xs font-medium transition"
          >
            {sidebarOpen ? '◀ Hide' : '▶ Show'} Sidebar
          </button>
          <span className="text-xs text-gray-500">
            {currentVideo.subject_title} · {currentVideo.section_title}
          </span>
          <span className="text-xs text-gray-500">{user?.name}</span>
        </div>

        {/* Video Player */}
        <div className="bg-black flex-shrink-0 relative" style={{ height: '52vh' }}>
          <div id="youtube-player" className="w-full h-full" />
          {videoError && (
            <div className="absolute inset-0 bg-gray-950 flex flex-col items-center justify-center gap-4">
              <div className="text-5xl">🎬</div>
              <p className="text-white font-semibold text-lg">Video unavailable for embedding</p>
              <p className="text-gray-400 text-sm">This video cannot be played here directly</p>
              <a
                href={`https://www.youtube.com/watch?v=${currentVideo.youtube_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold flex items-center gap-2 transition"
              >
                ▶ Watch on YouTube
              </a>
              <p className="text-gray-600 text-xs">After watching, come back and mark as complete</p>
              <button
                onClick={() => setCanComplete(true)}
                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm transition"
              >
                ✓ I watched it — unlock completion
              </button>
            </div>
          )}
        </div>

        {/* ── Progress Bar ── */}
        <div className="bg-gray-900 border-t border-gray-800 px-4 py-2.5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-xs w-10 font-mono">{formatTime(currentTime)}</span>

            {/* Track */}
            <div className="flex-1 relative h-2.5 bg-gray-700 rounded-full overflow-hidden group cursor-pointer">
              {/* 90% threshold marker */}
              <div
                className="absolute top-0 w-0.5 h-full bg-yellow-400/70 z-10"
                style={{ left: `${thresholdPercent}%` }}
                title="90% — unlock completion"
              />
              {/* Watched fill */}
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  progressPercent >= thresholdPercent
                    ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                    : 'bg-gradient-to-r from-blue-600 to-blue-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <span className="text-gray-400 text-xs w-10 font-mono text-right">
              {formatTime(realDuration || currentVideo.duration)}
            </span>
            <span className={`text-xs font-bold w-10 text-right ${
              progressPercent >= thresholdPercent ? 'text-green-400' : 'text-gray-500'
            }`}>
              {progressPercent}%
            </span>
          </div>

          {/* Status message */}
          <div className="mt-1.5 text-center h-4">
            {!isCompleted && !canComplete && (
              <p className="text-yellow-400/80 text-xs">
                ⏳ Watch {thresholdPercent}% to unlock completion
                {remaining > 0 ? ` · ${remaining}% remaining` : ''}
              </p>
            )}
            {!isCompleted && canComplete && !autoAdvanceCountdown && (
              <p className="text-green-400/80 text-xs">✓ You've watched enough — mark as complete!</p>
            )}
            {autoAdvanceCountdown !== null && (
              <p className="text-blue-400 text-xs animate-pulse">
                ▶ Auto-advancing to next lesson in {autoAdvanceCountdown}s —{' '}
                <button onClick={cancelAutoAdvance} className="underline hover:text-white">Cancel</button>
              </p>
            )}
          </div>
        </div>

        {/* ── Metadata & Actions ── */}
        <div className="bg-gray-950 border-t border-gray-800 p-5 overflow-y-auto flex-1">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white leading-tight">{currentVideo.title}</h1>
              <p className="text-gray-500 text-sm mt-0.5">{currentVideo.section_title}</p>
            </div>

            {/* Action area */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs text-gray-500 font-mono">
                ⏱ {formatTime(realDuration || currentVideo.duration)}
              </span>

              {isCompleted ? (
                <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm font-semibold flex items-center gap-2">
                  ✅ Completed
                </div>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <button
                    disabled={!canComplete || markingComplete}
                    onClick={() => handleMarkComplete(false)}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      !canComplete
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                        : markingComplete
                        ? 'bg-gray-700 text-gray-400 cursor-wait'
                        : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/30 active:scale-95'
                    }`}
                  >
                    {markingComplete
                      ? '⏳ Saving...'
                      : canComplete
                      ? '✓ Mark as Complete'
                      : `🔒 Watch ${thresholdPercent}% to unlock`}
                  </button>
                  {!canComplete && (
                    <p className="text-xs text-gray-600">
                      {progressPercent}% watched · {remaining}% more needed
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Concept box */}
          {currentVideo.concept && (
            <div className="mt-5 p-4 bg-blue-950/40 border border-blue-800/40 rounded-lg">
              <p className="text-xs font-semibold text-blue-400 mb-1 uppercase tracking-wider">Concept</p>
              <p className="text-sm text-blue-200/80 leading-relaxed">{currentVideo.concept}</p>
            </div>
          )}

          {/* Progress stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-gray-900 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-white">{progressPercent}%</p>
              <p className="text-xs text-gray-500 mt-0.5">Watched</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-white">{formatTime(currentTime)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Current Time</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 text-center">
              <p className={`text-lg font-bold ${canComplete ? 'text-green-400' : 'text-yellow-400'}`}>
                {canComplete ? '✓ Unlocked' : `${remaining}% left`}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Completion</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
