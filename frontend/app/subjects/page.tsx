'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/apiClient';

interface Subject {
  id: number;
  title: string;
  description: string;
  display_order: number;
}

export default function SubjectsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchSubjects();
  }, [user, router]);

  const fetchSubjects = async () => {
    try {
      const { data } = await apiClient.get('/subjects');
      setSubjects(data.subjects);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      router.push('/');
    }
  };

  const handleSubjectClick = (subjectId: number) => {
    router.push(`/subjects/${subjectId}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">LMS Platform</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/practice')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Practice Lab
          </button>
          <span className="text-sm">Welcome, {user.name}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-3xl font-bold mb-6">My Subjects</h2>

        {loading ? (
          <p className="text-gray-600">Loading subjects...</p>
        ) : subjects.length === 0 ? (
          <p className="text-gray-600">No subjects available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold mb-2">{subject.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{subject.description}</p>
                <button
                  onClick={() => handleSubjectClick(subject.id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Start Learning
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
