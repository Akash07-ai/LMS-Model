'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    { label: '', color: 'transparent' },
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f59e0b' },
    { label: 'Good', color: '#3b82f6' },
    { label: 'Strong', color: '#10b981' },
  ];
  return { score, ...levels[score] };
}

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword === '' || password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!agreed) { setError('Please accept the terms and conditions'); return; }
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/register', { name, email, password });
      setAuth(data.user, data.accessToken);
      setSuccess(true);
      setTimeout(() => router.push('/subjects'), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(0.95)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-30px,20px) scale(1.05)} 66%{transform:translate(20px,-20px) scale(0.9)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        @keyframes successPop { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes gradientShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes strengthGrow { from{width:0} }
        .blob1{animation:blob1 8s ease-in-out infinite}
        .blob2{animation:blob2 10s ease-in-out infinite}
        .fade-up{animation:fadeUp 0.6s ease forwards}
        .shake{animation:shake 0.4s ease}
        .success-pop{animation:successPop 0.5s ease forwards}
        .spinner{animation:spin 0.8s linear infinite}
        .gradient-text{background:linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradientShift 4s ease infinite}
        .gradient-btn{background:linear-gradient(135deg,#3b82f6,#8b5cf6);background-size:200% 200%;transition:all 0.3s ease}
        .gradient-btn:hover{background-position:right center;box-shadow:0 0 24px rgba(139,92,246,0.5);transform:translateY(-1px)}
        .gradient-btn:active{transform:translateY(0)}
        .glass-card{background:rgba(15,15,25,0.7);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.08)}
        .input-field{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);transition:all 0.2s ease;color:white}
        .input-field:focus{outline:none;border-color:rgba(139,92,246,0.6);background:rgba(255,255,255,0.08);box-shadow:0 0 0 3px rgba(139,92,246,0.15)}
        .input-field::placeholder{color:rgba(255,255,255,0.3)}
        .input-error{border-color:rgba(239,68,68,0.5)!important;box-shadow:0 0 0 3px rgba(239,68,68,0.1)!important}
        .glow-line{background:linear-gradient(90deg,transparent,#8b5cf6,#3b82f6,transparent)}
        .strength-bar{animation:strengthGrow 0.4s ease;transition:width 0.4s ease,background-color 0.4s ease}
      `}</style>

      <div className="min-h-screen flex bg-gray-950 overflow-hidden">

        {/* ── LEFT: Branding ── */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
          <div className="blob1 absolute top-1/4 left-1/4 w-80 h-80 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle,#3b82f6,#8b5cf6)' }} />
          <div className="blob2 absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle,#a78bfa,#ec4899)' }} />
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

          <div className="relative z-10 text-center fade-up">
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

            {/* Steps */}
            <div className="flex flex-col gap-4 items-start max-w-xs mx-auto">
              {[
                { step: '01', title: 'Create your account', desc: 'Free forever, no credit card' },
                { step: '02', title: 'Pick your courses', desc: '15+ expert-curated tracks' },
                { step: '03', title: 'Start learning', desc: 'At your own pace' },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-4 text-left">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>{s.step}</div>
                  <div>
                    <p className="text-white text-sm font-semibold">{s.title}</p>
                    <p className="text-gray-500 text-xs">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative overflow-y-auto">
          <div className="absolute inset-0 opacity-30"
            style={{ background: 'radial-gradient(ellipse at 80% 50%,rgba(139,92,246,0.15),transparent 60%)' }} />

          <div className={`glass-card w-full max-w-md rounded-2xl p-8 relative z-10 my-6 ${mounted ? 'fade-up' : 'opacity-0'}`}>
            <div className="glow-line h-px w-full mb-8 opacity-60" />

            <div className="mb-7">
              <div className="lg:hidden flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
                    <path d="M8 28L20 8L32 28H8Z" fill="white"/>
                  </svg>
                </div>
                <span className="text-white font-bold">LMS Platform</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Create your account</h2>
              <p className="text-gray-500 text-sm mt-1">Start your learning journey today — it's free</p>
            </div>

            {success ? (
              <div className="success-pop flex flex-col items-center py-8 gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#10b981,#3b82f6)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p className="text-white font-semibold text-lg">Account created!</p>
                <p className="text-gray-400 text-sm">Welcome aboard 🎉 Redirecting...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">

                {error && (
                  <div className="shake flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-300"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="John Doe" required
                    className="input-field w-full px-4 py-3 rounded-xl text-sm" />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="input-field w-full px-4 py-3 rounded-xl text-sm" />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters" required minLength={6}
                      className="input-field w-full px-4 py-3 pr-11 rounded-xl text-sm" />
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

                  {/* Password strength */}
                  {password && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex gap-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-400"
                            style={{ background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.1)' }} />
                        ))}
                      </div>
                      <p className="text-xs" style={{ color: strength.color }}>
                        {strength.label} password
                        {strength.score < 3 && <span className="text-gray-600"> — add uppercase, numbers & symbols</span>}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password" required
                      className={`input-field w-full px-4 py-3 pr-11 rounded-xl text-sm ${!passwordsMatch ? 'input-error' : ''}`} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                      {showConfirm ? (
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
                  {!passwordsMatch && (
                    <p className="text-xs text-red-400">Passwords do not match</p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2.5 pt-1">
                  <button type="button" onClick={() => setAgreed(!agreed)}
                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                    style={{ background: agreed ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)' : 'transparent', border: agreed ? 'none' : '1px solid rgba(255,255,255,0.2)' }}>
                    {agreed && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                  <span className="text-sm text-gray-400 leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-purple-400 hover:text-purple-300 transition">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-purple-400 hover:text-purple-300 transition">Privacy Policy</a>
                  </span>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading || !passwordsMatch}
                  className="gradient-btn w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 mt-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                  {loading ? (
                    <>
                      <svg className="spinner w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Creating account...
                    </>
                  ) : 'Create Account →'}
                </button>
              </form>
            )}

            {!success && (
              <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{' '}
                <a href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium transition">
                  Sign in →
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
