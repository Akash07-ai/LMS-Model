'use client';

import { useEffect, useState, useRef } from 'react';
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

export default function VideoPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const user = useAuthStore((state) => state.user);
  const [currentVideo, setCurrentVideo] = useState<CurrentVideo | null>(null);
  const [subjectTree, setSubjectTree] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [videoWatchedToEnd, setVideoWatchedToEnd] = useState(false);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchData();
    loadYouTubeAPI();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [user, params.videoId]);

  const fetchData = async () => {
    try {
      // Fetch current video
      const videoRes = await apiClient.get(`/videos/${params.videoId}`);
      setCurrentVideo(videoRes.data);
      
      // Fetch subject tree for sidebar
      const treeRes = await apiClient.get(`/subjects/${params.subjectId}/tree`);
      setSubjectTree(treeRes.data);
      
      setLoading(false);
      setTimeout(() => initializePlayer(videoRes.data), 1000);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      if (error.response?.status === 403) {
        alert('This video is locked. Complete previous videos first.');
        router.push(`/subjects/${params.subjectId}`);
      }
    }
  };

  const loadYouTubeAPI = () => {
    if (window.YT) return;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  };

  const initializePlayer = (videoData: CurrentVideo) => {
    if (!window.YT || !videoData) return;

    console.log('[PLAYER] Initializing player for video:', videoData.youtube_id);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoData.youtube_id,
        playerVars: {
          autoplay: 1,
          start: Math.floor(videoData.watched_duration || 0)
        },
        events: {
          onStateChange: (event: any) => {
            console.log('[PLAYER] onStateChange event:', event);
            onPlayerStateChange(event);
          },
          onReady: () => {
            console.log('[PLAYER] Player ready for video:', videoData.youtube_id);
          },
          onError: (error: any) => {
            console.error('[PLAYER] Error:', error);
          }
        }
      });
    };

    if (window.YT.Player) {
      console.log('[PLAYER] YT.Player exists, calling ready callback');
      window.onYouTubeIframeAPIReady();
    }
  };

  const onPlayerStateChange = (event: any) => {
    console.log('[PLAYER] State changed:', event.data);
    
    if (event.data === window.YT.PlayerState.PLAYING) {
      console.log('[PLAYER] Video is playing');
      startProgressTracking();
    } else if (event.data === window.YT.PlayerState.ENDED) {
      console.log('[PLAYER] Video has ended');
      stopProgressTracking();
      handleVideoEnded();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      console.log('[PLAYER] Video paused');
      stopProgressTracking();
    } else if (event.data === window.YT.PlayerState.BUFFERING) {
      console.log('[PLAYER] Video buffering');
    }
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) return;

    progressIntervalRef.current = setInterval(async () => {
      if (!playerRef.current || !currentVideo) return;

      const currentTime = Math.floor(playerRef.current.getCurrentTime());
      const duration = Math.floor(playerRef.current.getDuration());

      console.log('Progress tracking:', { currentTime, duration, videoId: currentVideo.id });

      try {
        const response = await apiClient.post(`/progress/${currentVideo.id}`, {
          watchedDuration: currentTime,
          completed: false
        });
        console.log('Progress saved:', response.data);
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }, 5000);
  };

  const handleVideoEnded = async () => {
    if (!currentVideo) return;

    console.log('Video ended event fired, enabling manual completion:', currentVideo.id);
    
    // Set state to indicate video has been watched to the end
    setVideoWatchedToEnd(true);
    
    // Stop progress tracking
    stopProgressTracking();
    
    // Show alert that video is finished
    setTimeout(() => {
      alert('✓ Video finished! You can now click "Mark as Complete" button to mark it as done.');
    }, 500);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleVideoClick = (videoId: number, locked: boolean) => {
    if (locked) {
      alert('Complete previous videos to unlock this one');
      return;
    }
    router.push(`/subjects/${params.subjectId}/video/${videoId}`);
  };

  if (!user || loading) return <div className="p-8">Loading...</div>;
  if (!currentVideo) return <div className="p-8">Video not found</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r overflow-y-auto`}>
        {sidebarOpen && subjectTree && (
          <div className="p-4">
            <div className="mb-4">
              <button
                onClick={() => router.push(`/subjects/${params.subjectId}`)}
                className="text-blue-600 hover:underline text-sm"
              >
                ← Back to Subject
              </button>
              <h2 className="text-lg font-bold mt-2">{subjectTree.title}</h2>
            </div>

            {/* Video Topics */}
            <div className="space-y-1">
              {subjectTree.sections.flatMap((section) => section.videos).map((video) => (
                <div
                  key={video.id}
                  onClick={() => handleVideoClick(video.id, video.locked)}
                  className={`p-3 rounded text-sm cursor-pointer transition ${
                    video.id === parseInt(params.videoId as string)
                      ? 'bg-blue-100 border-l-4 border-blue-600'
                      : video.locked
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {video.locked ? (
                      <span>🔒</span>
                    ) : video.is_completed ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-blue-600">▶</span>
                    )}
                    <span className={video.locked ? 'text-gray-400' : ''}>
                      {video.title}
                    </span>
                  </div>
                  {!video.locked && video.watched_duration > 0 && !video.is_completed && (
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-600 h-1 rounded-full"
                        style={{
                          width: `${Math.min((video.watched_duration / video.duration) * 100, 100)}%`
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            {sidebarOpen ? '◀ Hide' : '▶ Show'} Sidebar
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 bg-black flex items-center justify-center">
          <div className="w-full max-w-6xl aspect-video">
            <div id="youtube-player" className="w-full h-full"></div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white p-6 border-t">
          <h1 className="text-2xl font-bold mb-2">{currentVideo.title}</h1>
          <p className="text-gray-600 mb-4">{currentVideo.section_title}</p>
          
          {currentVideo.concept && (
            <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm font-semibold text-blue-900 mb-1">Concept:</p>
              <p className="text-sm text-blue-800">{currentVideo.concept}</p>
            </div>
          )}
          
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            {currentVideo.completed ? (
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded font-semibold">
                ✓ Completed
              </div>
            ) : (
              <>
                {videoWatchedToEnd && (
                  <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-semibold">
                    ✓ Video Watched
                  </div>
                )}
                <button
                  disabled={markingComplete}
                  onClick={async () => {
                    setMarkingComplete(true);
                    try {
                      const videoId = parseInt(params.videoId as string);
                      console.log('[COMPLETE] Starting mark complete process for video:', videoId);
                      console.log('[COMPLETE] Current video state:', { 
                        id: currentVideo.id, 
                        duration: currentVideo.duration,
                        videoId: videoId
                      });

                      // Get current watch duration from player
                      let watchedDuration = currentVideo.duration;
                      if (playerRef.current) {
                        try {
                          const currentTime = Math.floor(playerRef.current.getCurrentTime());
                          watchedDuration = Math.max(watchedDuration, currentTime);
                          console.log('[COMPLETE] Current player time:', currentTime);
                        } catch (e) {
                          console.log('[COMPLETE] Could not get player current time:', e);
                        }
                      }

                      // Step 1: Update progress
                      console.log('[COMPLETE] Step 1: Updating progress...');
                      const progressRes = await apiClient.post(`/progress/${videoId}`, {
                        watchedDuration: watchedDuration,
                        completed: true
                      });
                      console.log('[COMPLETE] Step 1 Success - Progress response:', progressRes.data);
                      
                      // Step 2: Update current video state
                      console.log('[COMPLETE] Step 2: Updating current video state...');
                      setCurrentVideo((prev) => prev ? { ...prev, completed: true } : null);
                      
                      // Step 3: Refresh subject tree
                      console.log('[COMPLETE] Step 3: Fetching updated subject tree...');
                      const treeRes = await apiClient.get(`/subjects/${params.subjectId}/tree`);
                      console.log('[COMPLETE] Step 3 Success - Subject tree refreshed');
                      setSubjectTree(treeRes.data);
                      
                      // Step 4: Get next video
                      console.log('[COMPLETE] Step 4: Fetching next video...');
                      await new Promise(resolve => setTimeout(resolve, 500));
                      
                      const nextRes = await apiClient.get(`/videos/${videoId}/next`);
                      console.log('[COMPLETE] Step 4 Success - Next video response:', nextRes.data);
                      
                      if (nextRes.data.video) {
                        const nextVideo = nextRes.data.video;
                        const playNext = confirm(`✓ Video completed! Play next video: "${nextVideo.title}"?`);
                        if (playNext) {
                          console.log('[COMPLETE] Navigating to next video:', nextVideo.id);
                          router.push(`/subjects/${params.subjectId}/video/${nextVideo.id}`);
                        } else {
                          alert('Video marked as complete! Next video is now unlocked.');
                        }
                      } else {
                        alert('🎉 Congratulations! You completed all videos in this subject!');
                        console.log('[COMPLETE] All videos completed, navigating to subject');
                        router.push(`/subjects/${params.subjectId}`);
                      }
                    } catch (error: any) {
                      console.error('[COMPLETE] Error occurred:', error);
                      console.error('[COMPLETE] Error details:', {
                        message: error.message,
                        status: error.response?.status,
                        data: error.response?.data,
                        config: error.config?.url
                      });
                      
                      const errorMsg = error.response?.data?.message || error.message || 'Unknown error occurred';
                      alert(`Failed to mark as complete: ${errorMsg}\n\nPlease check your connection and try again.`);
                    } finally {
                      setMarkingComplete(false);
                    }
                  }}
                  className={`px-4 py-2 rounded font-semibold transition ${
                    markingComplete
                      ? 'bg-gray-400 text-white cursor-wait'
                      : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                  }`}
                  title={!videoWatchedToEnd ? 'You can mark as complete anytime' : 'Click to mark video as complete'}
                >
                  {markingComplete ? '⏳ Processing...' : '✓ Mark as Complete'}
                </button>
              </>
            )}
            <div className="text-sm text-gray-600 font-medium">
              Duration: {Math.floor(currentVideo.duration / 60)}:{String(currentVideo.duration % 60).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
