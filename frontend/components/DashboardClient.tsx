'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AIAssistant from '@/components/AIAssistant';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';

interface DashboardData {
  subjectProgress: Array<SubjectProgress>;
  continueLearning: ContinueLearning | null;
  recentActivity: ActivityItem[];
  stats: Stats;
  weeklyActivity: WeeklyItem[];
  streak: number;
  upcoming: UpcomingItem[];
}

interface SubjectProgress {
  id: number;
  title: string;
  display_order: number;
  total_videos: number;
  completed_videos: number;
  total_watched_seconds: number;
}

interface ContinueLearning {
  video_id: number;
  video_title: string;
  youtube_id: string;
  duration: number;
  watched_duration: number;
  subject_id: number;
  subject_title: string;
}

interface ActivityItem {
  video_title: string;
  subject_title: string;
  last_watched: string;
  completed: number;
}

interface Stats {
  total_completed: number;
  courses_started: number;
  courses_completed: number;
  total_seconds: number;
}

interface WeeklyItem {
  day: string;
  minutes: number;
}

interface UpcomingItem {
  video_id: number;
  title: string;
  subject: string;
  due_date: string;
  progress: number;
}

interface ProgressItem {
  subject_id: number;
  subject_title: string;
  total_videos: number;
  completed_videos: number;
  progress_percentage: number;
}

interface Recommendation {
  subject_id: number;
  title: string;
  description: string;
  progress: number;
  sample_video_title: string;
  sample_youtube_id: string;
}

interface NotificationItem {
  id: string;
  type: string;
  message: string;
  metadata: string;
  created_at: string;
}

interface AchievementData {
  xp: number;
  level: string;
  streak: number;
  totalCompleted: number;
  totalSeconds: number;
  nextLevel: string;
  progressToNext: number;
  badges: Array<{ id: string; title: string; unlocked: boolean }>;
}

interface SavedItem {
  subject_id: number;
  title: string;
  description: string;
}

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
};

const progressClass = (value: number) => {
  if (value >= 90) return 'bg-emerald-400';
  if (value >= 60) return 'bg-sky-400';
  return 'bg-violet-500';
};

const DashboardClient = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = useCallback(() => {
    clearAuth();
    router.push('/auth/login');
  }, [clearAuth, router]);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [progressData, setProgressData] = useState<ProgressItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementData | null>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'inprogress' | 'completed'>('all');

  const loadSavedItems = useCallback(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem('lms-saved-lessons');
    if (!raw) return;
    try {
      setSavedItems(JSON.parse(raw));
    } catch {
      setSavedItems([]);
    }
  }, []);

  const persistSaved = useCallback((items: SavedItem[]) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('lms-saved-lessons', JSON.stringify(items));
    setSavedItems(items);
  }, []);

  const toggleSaved = useCallback(
    (course: Recommendation) => {
      const exists = savedItems.find((item) => item.subject_id === course.subject_id);
      if (exists) {
        persistSaved(savedItems.filter((item) => item.subject_id !== course.subject_id));
      } else {
        persistSaved([
          ...savedItems,
          { subject_id: course.subject_id, title: course.title, description: course.description },
        ]);
      }
    },
    [persistSaved, savedItems]
  );

  const ensureUser = useCallback(async () => {
    if (user) return true;
    if (typeof window === 'undefined') return false;
    const token = window.localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      const { data } = await apiClient.get('/users/me');
      setAuth(data.user, token);
      return true;
    } catch {
      return false;
    }
  }, [setAuth, user]);

  useEffect(() => {
    loadSavedItems();
  }, [loadSavedItems]);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      const isAuthenticated = await ensureUser();
      if (!mounted) return;
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await apiClient.get('/dashboard-data');
        if (!mounted) return;
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, [ensureUser]);

  useEffect(() => {
    if (!dashboardData) return;
    let mounted = true;
    setLoadingExtras(true);

    const loadExtras = async () => {
      try {
        const [progressRes, recRes, notifRes, achievementsRes] = await Promise.all([
          apiClient.get('/user-progress'),
          apiClient.get('/recommendations'),
          apiClient.get('/notifications'),
          apiClient.get('/achievements'),
        ]);

        if (!mounted) return;
        setProgressData(progressRes.data.progress || []);
        setRecommendations(recRes.data.recommendations || []);
        setNotifications(notifRes.data.notifications || []);
        setAchievements(achievementsRes.data || null);
      } catch (error) {
        console.error('Failed to load dashboard widgets:', error);
      } finally {
        if (mounted) setLoadingExtras(false);
      }
    };

    loadExtras();
    return () => {
      mounted = false;
    };
  }, [dashboardData]);

  const filteredCourses = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    const items = progressData.filter((course) =>
      course.subject_title.toLowerCase().includes(normalized)
    );

    if (activeTab === 'inprogress') {
      return items.filter((item) => item.progress_percentage > 0 && item.progress_percentage < 100);
    }
    if (activeTab === 'completed') {
      return items.filter((item) => item.progress_percentage === 100);
    }
    return items;
  }, [activeTab, progressData, searchQuery]);

  const hasToken = typeof window !== 'undefined' && window.localStorage.getItem('accessToken');
  const showLoginPrompt = !user && !hasToken && !loading;

  // Auth guard: redirect to login if no token
  useEffect(() => {
    if (!loading && showLoginPrompt) {
      router.push('/auth/login');
    }
  }, [loading, showLoginPrompt, router]);

  const continueProgress = dashboardData?.continueLearning
    ? Math.round((dashboardData.continueLearning.watched_duration / dashboardData.continueLearning.duration) * 100)
    : 0;

  const totalHours = dashboardData ? Math.round((dashboardData.stats.total_seconds / 3600) * 10) / 10 : 0;
  const completedCourses = dashboardData?.stats.courses_completed ?? 0;
  const inProgressCourses = dashboardData?.subjectProgress.filter((item) => item.completed_videos > 0 && item.completed_videos < item.total_videos).length ?? 0;

  const level = achievements?.level ?? 'Beginner';
  const xp = achievements?.xp ?? 0;
  const recentNotifications = notifications.slice(0, 4);

  if (loading && !showLoginPrompt) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
        }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
          <div className="h-16 rounded-3xl bg-slate-900" />
          <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
            <div className="space-y-6">
              <div className="h-44 rounded-3xl bg-slate-900" />
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="h-60 rounded-3xl bg-slate-900" />
                <div className="h-60 rounded-3xl bg-slate-900" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-44 rounded-3xl bg-slate-900" />
              <div className="h-48 rounded-3xl bg-slate-900" />
              <div className="h-40 rounded-3xl bg-slate-900" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showLoginPrompt) return null;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
      }`}>
      {/* ── Navbar ── */}
      <nav className={`mb-8 flex items-center justify-between px-6 py-4 ${theme === 'dark' ? 'bg-slate-900 border-b border-slate-800' : 'bg-gray-100 border-b border-gray-200'
        }`}>
        {/* LEFT: profile */}
        <div className="flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&bold=true`}
            className="w-10 h-10 rounded-full"
            alt="profile"
          />
          <div>
            <p className="font-semibold text-sm leading-tight">{user?.name || 'User'}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email}</p>
          </div>
        </div>

        {/* RIGHT: nav links + theme toggle + logout */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/subjects')}
            className={`hidden sm:block rounded-full px-4 py-2 text-sm font-medium transition ${theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
          >
            📚 Courses
          </button>
          <button
            onClick={() => router.push('/practice')}
            className={`hidden sm:block rounded-full px-4 py-2 text-sm font-medium transition ${theme === 'dark' ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700' : 'bg-gray-200 text-emerald-600 hover:bg-gray-300'
              }`}
          >
            💻 Practice
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${theme === 'dark'
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <button
            onClick={handleLogout}
            className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-sky-400">Learning Dashboard</p>
            <h1 className={`mt-3 text-4xl font-semibold tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Your learning experience, smarter.</h1>
            <p className={`mt-2 max-w-2xl ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>A personalized, data-driven dashboard built to feel like a real EdTech product.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={`rounded-3xl border p-5 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-gray-50'
              }`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Streak</p>
              <p className="mt-3 text-3xl font-semibold text-emerald-400">{dashboardData?.streak ?? 0}d</p>
              <p className={`mt-2 text-xs uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Daily learning</p>
            </div>
            <div className={`rounded-3xl border p-5 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-gray-50'
              }`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Hours this week</p>
              <p className="mt-3 text-3xl font-semibold text-sky-400">{totalHours}</p>
              <p className={`mt-2 text-xs uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Time spent</p>
            </div>
            <div className={`rounded-3xl border p-5 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-gray-50'
              }`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>XP Level</p>
              <p className="mt-3 text-3xl font-semibold text-violet-400">{level}</p>
              <p className={`mt-2 text-xs uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Progress score</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Continue Learning</p>
                  <h2 className="mt-2 text-2xl font-semibold">Pick up where you left off</h2>
                </div>
                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-sky-300">Top priority</span>
              </div>

              {dashboardData?.continueLearning ? (
                <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                      <p className="text-sm text-slate-400">{dashboardData.continueLearning.subject_title}</p>
                      <h3 className="mt-3 text-2xl font-semibold text-white">{dashboardData.continueLearning.video_title}</h3>
                      <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
                        <span>{continueProgress}% complete</span>
                        <span>•</span>
                        <span>{formatDuration(dashboardData.continueLearning.duration)}</span>
                      </div>
                      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                        <div className={`h-full ${progressClass(continueProgress)}`} style={{ width: `${continueProgress}%` }} />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/subjects/${dashboardData.continueLearning?.subject_id}/video/${dashboardData.continueLearning?.video_id}`)}
                    className="inline-flex min-w-[140px] items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                  >
                    Resume
                  </button>
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center text-slate-400">
                  <p className="text-lg font-semibold text-slate-200">No course in progress yet.</p>
                  <p className="mt-2 text-sm">Start a course to see your progress here.</p>
                  <button
                    onClick={() => router.push('/subjects')}
                    className="mt-4 rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                  >
                    Browse courses
                  </button>
                </div>
              )}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">Learning Analytics</p>
                    <h2 className="mt-2 text-xl font-semibold">Weekly learning</h2>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">Insights</span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-end gap-3">
                    {dashboardData?.weeklyActivity.map((item) => (
                      <div key={item.day} className="flex-1 text-center">
                        <div className="mx-auto mb-2 h-[120px] w-10 rounded-3xl bg-slate-800">
                          <div
                            className="h-full rounded-3xl bg-gradient-to-t from-sky-500 to-sky-300"
                            style={{ height: `${Math.min(100, item.minutes * 10)}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-400">{item.day}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl bg-slate-950 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Completed</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{dashboardData?.stats.total_completed ?? 0}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">In progress</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{inProgressCourses}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total time</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{totalHours}h</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">Goal progress</p>
                    <h2 className="mt-2 text-xl font-semibold">Learning streak</h2>
                  </div>
                  <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-300">{dashboardData?.streak ?? 0} days</div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl bg-slate-950 p-5">
                    <p className="text-sm text-slate-400">Current streak</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{dashboardData?.streak ?? 0} days</p>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, (dashboardData?.streak ?? 0) * 14)}%` }} />
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-950 p-5">
                    <p className="text-sm text-slate-400">Next badge</p>
                    <p className="mt-2 text-lg font-semibold text-white">7-day streak</p>
                    <p className="mt-2 text-sm text-slate-500">Keep a streak to unlock new achievement rewards.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">My Courses</p>
                    <h2 className="mt-2 text-xl font-semibold">Course overview</h2>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">{filteredCourses.length} items</span>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'inprogress', 'completed'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-full px-4 py-2 text-sm transition ${activeTab === tab ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                      >
                        {tab === 'all' ? 'All' : tab === 'inprogress' ? 'In Progress' : 'Completed'}
                      </button>
                    ))}
                  </div>
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search courses"
                    className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none focus:border-sky-400 sm:w-72"
                  />
                </div>
                <div className="mt-6 space-y-4">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.slice(0, 5).map((course) => (
                      <div key={course.subject_id} className="rounded-3xl bg-slate-950 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">{course.subject_title}</p>
                            <p className="text-xs text-slate-500">{course.progress_percentage}% complete</p>
                          </div>
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">{course.completed_videos}/{course.total_videos}</span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                          <div className={`${progressClass(course.progress_percentage)} h-full`} style={{ width: `${course.progress_percentage}%` }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center text-slate-400">
                      <p className="font-semibold text-slate-200">No courses match your search.</p>
                      <p className="mt-2 text-sm">Adjust the filter or start a new course to populate this section.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">Upcoming deadlines</p>
                    <h2 className="mt-2 text-xl font-semibold">Schedule</h2>
                  </div>
                  <Link href="/subjects" className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400 hover:bg-slate-700">
                    View all
                  </Link>
                </div>
                <div className="mt-6 space-y-4">
                  {dashboardData?.upcoming.length ? (
                    dashboardData.upcoming.map((item) => (
                      <div key={item.video_id} className="rounded-3xl bg-slate-950 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">{item.title}</p>
                            <p className="text-sm text-slate-500">{item.subject} • due {item.due_date}</p>
                          </div>
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">{item.progress}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center text-slate-400">
                      <p className="font-semibold text-slate-200">You're all caught up.</p>
                      <p className="mt-2 text-sm">Complete a lesson to see upcoming schedule reminders.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ── Learning Tip of the Day ── */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Learning Tip</p>
                  <h2 className="mt-2 text-xl font-semibold">Tip of the day</h2>
                </div>
                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-violet-400">Daily</span>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { tip: 'Break large topics into 25-min focused sessions using the Pomodoro technique.', icon: '⏰' },
                  { tip: 'Teach what you learn — explaining concepts out loud boosts retention by 90%.', icon: '🗣️' },
                  { tip: 'Review yesterday\'s notes before starting today\'s lesson.', icon: '📝' },
                ][new Date().getDay() % 3] && (
                    <div className="rounded-3xl bg-slate-950 p-5">
                      <p className="text-2xl mb-3">
                        {['⏰', '🗣️', '📝'][new Date().getDay() % 3]}
                      </p>
                      <p className="text-slate-200 text-sm leading-relaxed">
                        {[
                          'Break large topics into 25-min focused sessions using the Pomodoro technique.',
                          'Teach what you learn — explaining concepts out loud boosts retention by 90%.',
                          "Review yesterday's notes before starting today's lesson.",
                        ][new Date().getDay() % 3]}
                      </p>
                    </div>
                  )}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-3xl bg-slate-950 p-4 text-center">
                    <p className="text-2xl font-bold text-sky-400">{dashboardData?.stats.total_completed ?? 0}</p>
                    <p className="mt-1 text-xs text-slate-500">Videos done</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950 p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{dashboardData?.streak ?? 0}</p>
                    <p className="mt-1 text-xs text-slate-500">Day streak</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950 p-4 text-center">
                    <p className="text-2xl font-bold text-violet-400">{xp}</p>
                    <p className="mt-1 text-xs text-slate-500">Total XP</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Recommended for You</p>
                  <h2 className="mt-2 text-xl font-semibold">Personalized picks</h2>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">{recommendations.length} suggested</span>
              </div>
              <div className="mt-6 space-y-4">
                {recommendations.length > 0 ? (
                  recommendations.map((rec) => (
                    <div key={rec.subject_id} className="rounded-3xl bg-slate-950 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">{rec.title}</p>
                          <p className="mt-2 text-sm text-slate-400">{rec.description}</p>
                          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">{rec.progress}% complete</p>
                        </div>
                        <button
                          onClick={() => toggleSaved(rec)}
                          className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 transition hover:border-slate-500"
                        >
                          {savedItems.some((item) => item.subject_id === rec.subject_id) ? 'Saved' : 'Save'}
                        </button>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-400">
                        <span>{rec.sample_video_title}</span>
                        <Link
                          href={`/subjects/${rec.subject_id}`}
                          className="rounded-full bg-slate-800 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300 hover:bg-slate-700"
                        >
                          Open course
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center text-slate-400">
                    <p className="font-semibold text-slate-200">No recommendations found.</p>
                    <p className="mt-2 text-sm">Continue learning to get smarter course suggestions.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Achievement badges</p>
                  <h2 className="mt-2 text-xl font-semibold">Gamification</h2>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">{xp} XP</span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-slate-950 p-5">
                  <p className="text-sm text-slate-400">Current level</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{level}</p>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full bg-violet-400" style={{ width: `${achievements?.progressToNext ?? 0}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{achievements?.progressToNext ?? 0}% to {achievements?.nextLevel}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {achievements?.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`rounded-3xl border p-4 text-center ${badge.unlocked ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-800 bg-slate-950'}`}
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{badge.unlocked ? 'Unlocked' : 'Locked'}</p>
                      <p className="mt-3 text-sm font-semibold text-white">{badge.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Practice Lab</p>
                  <h2 className="mt-2 text-xl font-semibold">CodeLab shortcut</h2>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">Quick access</span>
              </div>
              <div className="mt-6 rounded-3xl bg-slate-950 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Problems solved</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{Math.max(8, (dashboardData?.stats.total_completed ?? 0) * 2 + 10)}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-800 px-4 py-3 text-center text-sm text-slate-300">
                    <p className="text-slate-400">Accuracy</p>
                    <p className="mt-2 text-xl font-semibold text-white">{Math.min(98, Math.max(70, (dashboardData?.stats.total_completed ?? 0) * 5 + 70))}%</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/practice')}
                  className="mt-6 w-full rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                >
                  Start Practice
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Notifications</p>
                  <h2 className="mt-2 text-xl font-semibold">Alerts</h2>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">Latest</span>
              </div>
              <div className="mt-6 space-y-3">
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((note) => (
                    <div key={note.id} className="rounded-3xl bg-slate-950 p-4">
                      <p className="font-medium text-white">{note.message}</p>
                      <p className="mt-1 text-sm text-slate-500">{note.metadata}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center text-slate-400">
                    <p className="font-semibold text-slate-200">No new notifications.</p>
                    <p className="mt-2 text-sm">Your dashboard will show reminders and course updates here.</p>
                  </div>
                )}
              </div>
            </section>

            {/* ── Daily Goals ── */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Daily Goals</p>
                  <h2 className="mt-2 text-xl font-semibold">Today's targets</h2>
                </div>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-amber-400">Daily</span>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { label: 'Watch 2 videos', done: (dashboardData?.stats.total_completed ?? 0) >= 2, icon: '🎬' },
                  { label: 'Solve 1 coding problem', done: (dashboardData?.stats.total_completed ?? 0) >= 1, icon: '💻' },
                  { label: 'Maintain streak', done: (dashboardData?.streak ?? 0) > 0, icon: '🔥' },
                  { label: 'Study 30 minutes', done: (dashboardData?.stats.total_seconds ?? 0) >= 1800, icon: '⏱️' },
                ].map((goal) => (
                  <div key={goal.label} className="flex items-center gap-3 rounded-3xl bg-slate-950 px-4 py-3">
                    <span className="text-lg">{goal.icon}</span>
                    <span className={`flex-1 text-sm ${goal.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>{goal.label}</span>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${goal.done ? 'bg-emerald-500' : 'border border-slate-600'
                      }`}>
                      {goal.done && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Quick Links ── */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Quick Links</p>
                  <h2 className="mt-2 text-xl font-semibold">Jump to</h2>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { label: 'All Courses', icon: '📚', path: '/subjects', color: 'text-sky-400' },
                  { label: 'Practice Lab', icon: '💻', path: '/practice', color: 'text-emerald-400' },
                  { label: 'Continue Video', icon: '▶️', path: dashboardData?.continueLearning ? `/subjects/${dashboardData.continueLearning.subject_id}/video/${dashboardData.continueLearning.video_id}` : '/subjects', color: 'text-violet-400' },
                  { label: 'Leaderboard', icon: '🏆', path: '/subjects', color: 'text-amber-400' },
                ].map((link) => (
                  <button
                    key={link.label}
                    onClick={() => router.push(link.path)}
                    className="flex flex-col items-center gap-2 rounded-3xl bg-slate-950 p-4 transition hover:bg-slate-800"
                  >
                    <span className="text-2xl">{link.icon}</span>
                    <span className={`text-xs font-medium ${link.color}`}>{link.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">Activity feed</p>
                <h2 className="mt-2 text-xl font-semibold">Recent actions</h2>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">Latest 5</span>
            </div>
            <div className="mt-6 space-y-4">
              {dashboardData?.recentActivity.length ? (
                dashboardData.recentActivity.map((item, index) => (
                  <div key={`${item.video_title}-${index}`} className="rounded-3xl bg-slate-950 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{item.completed ? 'Completed lesson' : 'Watched lesson'}</p>
                        <p className="mt-1 text-sm text-slate-400">{item.video_title}</p>
                      </div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{new Date(item.last_watched).toLocaleDateString()}</p>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">{item.subject_title}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center text-slate-400">
                  <p className="font-semibold text-slate-200">No recent activity yet.</p>
                  <p className="mt-2 text-sm">Start learning to build your activity feed.</p>
                </div>
              )}
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Saved for Later</p>
                  <h2 className="mt-2 text-xl font-semibold">Bookmarks</h2>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">{savedItems.length}</span>
              </div>
              <div className="mt-6 space-y-4">
                {savedItems.length > 0 ? (
                  savedItems.map((item) => (
                    <div key={item.subject_id} className="rounded-3xl bg-slate-950 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                        </div>
                        <button
                          onClick={() => persistSaved(savedItems.filter((saved) => saved.subject_id !== item.subject_id))}
                          className="rounded-full bg-slate-800 px-3 py-2 text-xs text-slate-200 hover:bg-slate-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center text-slate-400">
                    <p className="font-semibold text-slate-200">Nothing saved yet.</p>
                    <p className="mt-2 text-sm">Save course suggestions to return later.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Community</p>
                  <h2 className="mt-2 text-xl font-semibold">Discussion</h2>
                </div>
                <button
                  onClick={() => router.push('/subjects')}
                  className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400 hover:bg-slate-700"
                >
                  Ask a doubt
                </button>
              </div>
              <div className="mt-6 space-y-3">
                <div className="rounded-3xl bg-slate-950 p-4">
                  <p className="font-semibold text-white">How do I finish React Router faster?</p>
                  <p className="mt-1 text-sm text-slate-400">Students are sharing tips on routing and nested layouts.</p>
                </div>
                <div className="rounded-3xl bg-slate-950 p-4">
                  <p className="font-semibold text-white">Best way to track video progress?</p>
                  <p className="mt-1 text-sm text-slate-400">See how others manage daily streaks and practice sessions.</p>
                </div>
              </div>
            </section>

            <AIAssistant />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;

