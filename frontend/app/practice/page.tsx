'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/apiClient';

interface Problem {
  id: number;
  subject_id: number;
  title: string;
  difficulty: string;
}

interface Subject {
  id: number;
  title: string;
}

export default function PracticeListPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [problems, setProblems] = useState<{ [key: number]: Problem[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch all problems from subject_id = 1 (universal problems)
      const { data } = await apiClient.get('/coding/problems/1');
      if (data.problems && data.problems.length > 0) {
        setProblems({ 1: data.problems });
        setSubjects([{ id: 1, title: 'All Coding Problems' }]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold mb-8">Coding Practice</h1>

        {subjects.map((subject) => {
          const subjectProblems = problems[subject.id];
          if (!subjectProblems || subjectProblems.length === 0) return null;

          return (
            <div key={subject.id} className="mb-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">{subject.title}</h2>
              
              <div className="space-y-3">
                {subjectProblems.map((problem) => (
                  <div
                    key={problem.id}
                    onClick={() => router.push(`/practice/${problem.id}`)}
                    className="p-4 border rounded-lg hover:border-blue-500 hover:shadow cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{problem.title}</h3>
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
