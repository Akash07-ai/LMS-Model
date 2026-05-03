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

const ACCENTS = [
  { from: '#f59e0b', to: '#ef4444', icon: '⚡', label: 'JS' },
  { from: '#3b82f6', to: '#8b5cf6', icon: '⚛️', label: 'React' },
  { from: '#10b981', to: '#3b82f6', icon: '🟢', label: 'Node' },
  { from: '#f59e0b', to: '#f97316', icon: '🐍', label: 'Python' },
  { from: '#8b5cf6', to: '#ec4899', icon: '🤖', label: 'ML' },
  { from: '#06b6d4', to: '#3b82f6', icon: '🎨', label: 'Design' },
  { from: '#10b981', to: '#06b6d4', icon: '🗄️', label: 'DB' },
  { from: '#f97316', to: '#ef4444', icon: '☁️', label: 'AWS' },
  { from: '#ec4899', to: '#8b5cf6', icon: '📱', label: 'Mobile' },
  { from: '#ef4444', to: '#f97316', icon: '🔐', label: 'Security' },
  { from: '#3b82f6', to: '#06b6d4', icon: '📊', label: 'Data' },
  { from: '#8b5cf6', to: '#3b82f6', icon: '🚀', label: 'DevOps' },
  { from: '#f59e0b', to: '#10b981', icon: '🎭', label: 'UI/UX' },
  { from: '#06b6d4', to: '#8b5cf6', icon: '⛓️', label: 'Web3' },
  { from: '#10b981', to: '#f59e0b', icon: '🎮', label: 'Unity' },
];

function SkeletonCard() {
  return (
    <div className="lms-card rounded-2xl overflow-hidden animate-pulse">
      <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 rounded-full w-3/4" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="h-2.5 rounded-full w-1/2" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
        </div>
        <div className="space-y-2 mb-6">
          <div className="h-2.5 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="h-2.5 rounded-full w-5/6" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="h-2.5 rounded-full w-2/3" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
        <div className="h-9 rounded-xl w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>
    </div>
  );
}

export default function SubjectsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#profile-menu')) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
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
    try { await apiClient.post('/auth/logout'); }
    catch (error) { console.error('Logout error:', error); }
    finally { clearAuth(); router.push('/auth/login'); }
  };

  const handleSubjectClick = (subjectId: number) => {
    router.push(`/subjects/${subjectId}`);
  };

  if (!user) return null;

  const filtered = subjects.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <style>{`
        :root {
          --bg: #07070f;
          --surface: rgba(255,255,255,0.035);
          --surface-hover: rgba(255,255,255,0.065);
          --border: rgba(255,255,255,0.07);
          --border-hover: rgba(255,255,255,0.13);
        }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }
        @keyframes gradShift {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .page-enter { animation: fadeIn 0.5s ease forwards; }
        .card-enter { animation: fadeUp 0.5s ease forwards; opacity: 0; }

        .lms-card {
          background: var(--surface);
          border: 1px solid var(--border);
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease;
        }
        .lms-card:hover {
          background: var(--surface-hover);
          border-color: var(--border-hover);
          transform: translateY(-5px);
          box-shadow: 0 24px 48px rgba(0,0,0,0.45);
        }

        .nav-glass {
          background: rgba(7,7,15,0.82);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--border);
        }

        .search-wrap {
          background: rgba(255,255,255,0.055);
          border: 1px solid var(--border);
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .search-wrap:focus-within {
          border-color: rgba(139,92,246,0.55);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
        }
        .search-wrap input {
          background: transparent;
          color: white;
          outline: none;
          width: 100%;
        }
        .search-wrap input::placeholder { color: rgba(255,255,255,0.28); }

        .pill-btn {
          background: rgba(255,255,255,0.055);
          border: 1px solid var(--border);
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .pill-btn:hover {
          background: rgba(255,255,255,0.09);
          border-color: var(--border-hover);
        }

        .practice-pill {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.22);
          transition: all 0.2s ease;
        }
        .practice-pill:hover {
          background: rgba(16,185,129,0.18);
          border-color: rgba(16,185,129,0.4);
          box-shadow: 0 0 18px rgba(16,185,129,0.18);
        }

        .avatar-ring {
          background: linear-gradient(135deg,#3b82f6,#8b5cf6);
          padding: 2px;
          border-radius: 50%;
        }
        .avatar-inner {
          background: #07070f;
          border-radius: 50%;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .grad-text {
          background: linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradShift 5s ease infinite;
        }

        .stat-chip {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          transition: background 0.2s;
        }
        .stat-chip:hover { background: rgba(255,255,255,0.08); }

        .card-btn {
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .card-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .card-btn:active { transform: scale(0.97); }

        .dropdown-menu {
          background: rgba(12,12,22,0.98);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
          animation: fadeUp 0.18s ease forwards;
        }
        .drop-item {
          transition: background 0.15s, color 0.15s;
        }
        .drop-item:hover { background: rgba(255,255,255,0.05); color: white; }

        .section-divider {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
        }

        /* noise texture overlay */
        .noise::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.4;
        }
      `}</style>

      <div className="min-h-screen w-full page-enter" style={{ background: 'var(--bg)' }}>

        {/* ── Navbar ──────────────────────────────────────────────────────── */}
        <nav className="nav-glass sticky top-0 z-50 px-5 py-3 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', boxShadow: '0 0 16px rgba(139,92,246,0.35)' }}>
              <svg width="15" height="15" viewBox="0 0 40 40" fill="none">
                <path d="M8 28L20 8L32 28H8Z" fill="white" fillOpacity="0.95"/>
                <path d="M14 28L20 18L26 28H14Z" fill="white" fillOpacity="0.35"/>
              </svg>
            </div>
            <span className="text-white font-semibold text-[15px] tracking-tight">LMS Platform</span>
          </div>

          {/* Search — desktop */}
          <div className="hidden md:flex search-wrap items-center gap-2 px-3 py-2 rounded-xl flex-1 max-w-xs">
            <svg className="text-gray-600 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-600 hover:text-gray-400 flex-shrink-0 transition">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => router.push('/practice')}
              className="practice-pill px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
              <span className="hidden sm:inline">Practice Lab</span>
            </button>

            {/* Profile */}
            <div className="relative" id="profile-menu">
              <button onClick={() => setProfileOpen(!profileOpen)}
                className="pill-btn flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl">
                <div className="avatar-ring w-7 h-7 flex-shrink-0">
                  <div className="avatar-inner">
                    <span className="text-[11px] font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
                <span className="text-[13px] text-gray-300 hidden sm:block font-medium">{user.name.split(' ')[0]}</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className={`text-gray-600 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {profileOpen && (
                <div className="dropdown-menu absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50">
                  {/* User header */}
                  <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-3">
                      <div className="avatar-ring w-10 h-10 flex-shrink-0">
                        <div className="avatar-inner">
                          <span className="text-sm font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate leading-tight">{user.name}</p>
                        <p className="text-gray-500 text-xs truncate mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-1.5 space-y-0.5">
                    {[
                      { icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>, icon2: <circle cx="12" cy="7" r="4"/>, label: 'My Profile', action: () => setProfileOpen(false) },
                      { icon: <circle cx="12" cy="12" r="3"/>, icon2: null, label: 'Settings', action: () => setProfileOpen(false), settingsIcon: true },
                    ].map((item, i) => (
                      <button key={i} onClick={item.action}
                        className="drop-item w-full px-3 py-2.5 rounded-xl text-left text-sm text-gray-400 flex items-center gap-3">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          {item.icon}{item.icon2}
                        </svg>
                        {item.label}
                      </button>
                    ))}
                    <button onClick={() => { setProfileOpen(false); router.push('/practice'); }}
                      className="drop-item w-full px-3 py-2.5 rounded-xl text-left text-sm text-gray-400 flex items-center gap-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                      </svg>
                      Practice Lab
                    </button>
                  </div>

                  <div className="p-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button onClick={handleLogout}
                      className="w-full px-3 py-2.5 rounded-xl text-left text-sm text-red-400 flex items-center gap-3 transition hover:bg-red-500/8">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 py-10">

          {/* Hero */}
          <div className="mb-10 card-enter" style={{ animationDelay: '0.05s' }}>
            <p className="text-gray-600 text-sm font-medium mb-1 tracking-wide uppercase">{greeting}</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight leading-tight">
              {user.name.split(' ')[0]}, <span className="grad-text">keep building</span> 🚀
            </h1>

            {/* Stat chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { label: 'Courses', value: subjects.length, icon: '📚' },
                { label: 'Available', value: `${subjects.length} tracks`, icon: '🎯' },
                { label: 'Practice', value: 'CodeLab', icon: '💻' },
              ].map((s, i) => (
                <div key={i} className="stat-chip flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs">
                  <span>{s.icon}</span>
                  <span className="text-gray-400">{s.label}</span>
                  <span className="text-white font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section header */}
          <div className="flex items-center justify-between mb-5 card-enter" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3">
              <h2 className="text-white font-semibold text-base">All Courses</h2>
              {!loading && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium text-gray-500"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {filtered.length}
                </span>
              )}
            </div>

            {/* Mobile search */}
            <div className="md:hidden search-wrap flex items-center gap-2 px-3 py-1.5 rounded-xl">
              <svg className="text-gray-600" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="text" placeholder="Search..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="text-xs w-28" />
            </div>
          </div>

          {/* 1px divider */}
          <div className="section-divider h-px w-full mb-7" />

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 card-enter">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                🔍
              </div>
              <div className="text-center">
                <p className="text-white font-semibold mb-1">No courses found</p>
                <p className="text-gray-600 text-sm">Try a different search term</p>
              </div>
              <button onClick={() => setSearch('')}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 transition hover:text-white"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((subject, i) => {
                const accent = ACCENTS[(subject.display_order - 1) % ACCENTS.length];
                return (
                  <div key={subject.id} className="lms-card rounded-2xl overflow-hidden flex flex-col card-enter"
                    style={{ animationDelay: `${0.12 + (i % 8) * 0.04}s` }}>

                    {/* Top accent bar */}
                    <div className="h-[3px] w-full flex-shrink-0"
                      style={{ background: `linear-gradient(90deg,${accent.from},${accent.to})` }} />

                    <div className="p-5 flex flex-col flex-1">
                      {/* Icon + badge row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg,${accent.from}18,${accent.to}18)`,
                            border: `1px solid ${accent.from}28`
                          }}>
                          {accent.icon}
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: `${accent.from}15`,
                            color: accent.from,
                            border: `1px solid ${accent.from}25`
                          }}>
                          {accent.label}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-white font-semibold text-[14px] leading-snug mb-2">
                        {subject.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-500 text-xs leading-relaxed flex-1 mb-5 line-clamp-3">
                        {subject.description}
                      </p>

                      {/* CTA */}
                      <button
                        onClick={() => handleSubjectClick(subject.id)}
                        className="card-btn w-full py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                        style={{
                          background: `linear-gradient(135deg,${accent.from},${accent.to})`,
                          boxShadow: `0 4px 16px ${accent.from}28`
                        }}>
                        Start Learning
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                          <polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
