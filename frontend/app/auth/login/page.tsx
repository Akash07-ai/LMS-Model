'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem('accessToken')) router.replace('/dashboard');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      setAuth(data.user, data.accessToken);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes blob1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-20px) scale(1.1); }
          66% { transform: translate(-20px,20px) scale(0.95); }
        }
        @keyframes blob2 {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(-30px,20px) scale(1.05); }
          66% { transform: translate(20px,-20px) scale(0.9); }
        }
        @keyframes blob3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(15px,15px) scale(1.08); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20%,60% { transform:translateX(-6px); }
          40%,80% { transform:translateX(6px); }
        }
        @keyframes successPop {
          0%   { transform:scale(0.8); opacity:0; }
          60%  { transform:scale(1.1); }
          100% { transform:scale(1); opacity:1; }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes gradientShift {
          0%,100% { background-position:0% 50%; }
          50%      { background-position:100% 50%; }
        }
        .blob1 { animation: blob1 8s ease-in-out infinite; }
        .blob2 { animation: blob2 10s ease-in-out infinite; }
        .blob3 { animation: blob3 12s ease-in-out infinite; }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .fade-up-delay { animation: fadeUp 0.6s ease 0.15s forwards; opacity:0; }
        .fade-up-delay2 { animation: fadeUp 0.6s ease 0.3s forwards; opacity:0; }
        .shake { animation: shake 0.4s ease; }
        .success-pop { animation: successPop 0.5s ease forwards; }
        .spinner { animation: spin 0.8s linear infinite; }
        .gradient-text {
          background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 4s ease infinite;
        }
        .gradient-btn {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          background-size: 200% 200%;
          transition: all 0.3s ease;
        }
        .gradient-btn:hover {
          background-position: right center;
          box-shadow: 0 0 24px rgba(139,92,246,0.5);
          transform: translateY(-1px);
        }
        .gradient-btn:active { transform: translateY(0); }
        .glass-card {
          background: rgba(15,15,25,0.7);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .input-field {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.2s ease;
          color: white;
        }
        .input-field:focus {
          outline: none;
          border-color: rgba(139,92,246,0.6);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.15);
        }
        .input-field::placeholder { color: rgba(255,255,255,0.3); }
        .glow-line {
          background: linear-gradient(90deg, transparent, #8b5cf6, #3b82f6, transparent);
        }
      `}</style>

      <div className="min-h-screen flex bg-gray-950 overflow-hidden">

        {/* ── LEFT: Branding ── */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
          {/* Animated blobs */}
          <div className="blob1 absolute top-1/4 left-1/4 w-80 h-80 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #3b82f6, #8b5cf6)' }} />
          <div className="blob2 absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #a78bfa, #ec4899)' }} />
          <div className="blob3 absolute top-1/2 left-1/2 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #60a5fa, #34d399)' }} />

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

          <div className="relative z-10 text-center fade-up">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', boxShadow: '0 0 40px rgba(139,92,246,0.4)' }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M8 28L20 8L32 28H8Z" fill="white" fillOpacity="0.9"/>
                <path d="M14 28L20 18L26 28H14Z" fill="white" fillOpacity="0.4"/>
              </svg>
            </div>

            <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
              LMS <span className="gradient-text">Platform</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 font-light tracking-wide">
              Learn. Build. <span className="text-purple-400">Grow.</span>
            </p>

            {/* Feature pills */}
            <div className="flex flex-col gap-3 items-start max-w-xs mx-auto">
              {[
                { icon: '🎯', text: '15+ Expert-curated courses' },
                { icon: '⚡', text: 'Sequential video unlocking' },
                { icon: '📊', text: 'Real-time progress tracking' },
                { icon: '🏆', text: 'Completion certificates' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', animationDelay: `${i * 0.1}s` }}>
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-gray-300 text-sm">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
          <div className="absolute inset-0 opacity-30"
            style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.15), transparent 60%)' }} />

          <div className={`glass-card w-full max-w-md rounded-2xl p-8 relative z-10 ${mounted ? 'fade-up' : 'opacity-0'}`}>

            {/* Top glow line */}
            <div className="glow-line h-px w-full mb-8 opacity-60" />

            {/* Header */}
            <div className="mb-8">
              <div className="lg:hidden flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
                    <path d="M8 28L20 8L32 28H8Z" fill="white"/>
                  </svg>
                </div>
                <span className="text-white font-bold">LMS Platform</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-gray-500 text-sm mt-1">Sign in to continue your learning journey</p>
            </div>

            {/* Success state */}
            {success ? (
              <div className="success-pop flex flex-col items-center py-8 gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#10b981,#3b82f6)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p className="text-white font-semibold text-lg">Login successful!</p>
                <p className="text-gray-400 text-sm">Redirecting to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Error */}
                {error && (
                  <div className={`shake flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-300`}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="input-field w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
                    <a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="input-field w-full px-4 py-3 pr-11 rounded-xl text-sm"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2.5">
                  <button type="button" onClick={() => setRememberMe(!rememberMe)}
                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all ${rememberMe ? 'bg-purple-600 border-purple-600' : 'border border-gray-600'}`}
                    style={{ border: rememberMe ? 'none' : '1px solid rgba(255,255,255,0.2)' }}>
                    {rememberMe && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                  <span className="text-sm text-gray-400">Remember me for 30 days</span>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="gradient-btn w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 mt-2">
                  {loading ? (
                    <>
                      <svg className="spinner w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Signing in...
                    </>
                  ) : 'Sign In →'}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <span className="text-xs text-gray-600">OR</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                </div>

                {/* Google */}
                <button type="button"
                  className="w-full py-3 rounded-xl text-sm font-medium text-gray-300 flex items-center justify-center gap-3 transition-all hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </form>
            )}

            {/* Footer */}
            {!success && (
              <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account?{' '}
                <a href="/auth/register" className="text-purple-400 hover:text-purple-300 font-medium transition">
                  Create account →
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
