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

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

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
    if (isLocked) {
      alert('Complete previous videos to unlock this one');
      return;
    }
    router.push(`/subjects/${params.subjectId}/video/${videoId}`);
  };

  if (!user || loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4">
        <button
          onClick={() => router.push('/subjects')}
          className="text-blue-600 hover:underline"
        >
          ← Back to Subjects
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-8">
        {subject && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{subject.title}</h1>
            <p className="text-gray-600">{subject.description}</p>
          </div>
        )}

        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">{section.title}</h2>
              
              <div className="space-y-2">
                {section.videos.map((video) => {
                  const progress = video.watched_duration && video.duration
                    ? Math.round((video.watched_duration / video.duration) * 100)
                    : 0;

                  return (
                    <div
                      key={video.id}
                      onClick={() => handleVideoClick(video.id, video.locked)}
                      className={`p-4 rounded border cursor-pointer transition ${
                        video.locked
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                          : 'bg-white border-gray-200 hover:border-blue-500 hover:shadow'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {video.locked ? (
                            <span className="text-gray-400">🔒</span>
                          ) : video.is_completed ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-blue-600">▶</span>
                          )}
                          <div>
                            <h3 className={`font-medium ${video.locked ? 'text-gray-400' : ''}`}>
                              {video.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                            </p>
                          </div>
                        </div>
                        
                        {!video.locked && progress > 0 && (
                          <div className="text-sm text-gray-600">
                            {progress}% complete
                          </div>
                        )}
                      </div>
                      
                      {!video.locked && progress > 0 && progress < 100 && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
