import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { apiClient } from '../api/client';
import { Loader2, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';
import logoImg from '../logo.png';

type Mode = 'login' | 'register';

export function LoginScreen() {
  const setAuth = useAppStore(state => state.setAuth);
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login' ? { email, password } : { email, password, name };
      const res = await apiClient.post(endpoint, payload);
      setAuth(res.data.token, res.data.user);
      navigate('/onboarding-lang');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/auth/demo-login', {});
      setAuth(res.data.token, res.data.user);
      navigate('/onboarding-lang');
    } catch {
      setError('Demo login unavailable. Please register an account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-b from-[#001730] to-[#000d1a] text-white relative overflow-hidden font-sans">
      
      {/* Dynamic Glow Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      {/* Background Animated Arrows */}
      <div className="arrow-container">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="moving-arrow" 
            style={{ 
              animationDelay: `${i * 1.5}s`, 
              height: `${Math.random() * 100 + 200}px`,
              opacity: 0.8
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            <div className="arrow-tail" style={{ height: '100%' }} />
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col px-6 pt-12 pb-10 z-10 relative">
        
        {/* Back Button */}
        <div 
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 backdrop-blur-md cursor-pointer hover:bg-white/10 transition-colors"
        >
           <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
        </div>

        {/* Top branding — fills upper half with identity */}
        <div className="flex flex-col items-center justify-center mb-10 flex-shrink-0">
          <div className="w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/20 border-b-white/5 border-r-white/5 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-2.5 mb-5 overflow-hidden">
            <img src={logoImg} alt="Arth AI Logo" className="w-full h-full object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1 text-white">Arth AI</h1>
          <p className="text-white/60 text-sm font-medium">Your IDBI Wealth Advisor</p>
        </div>

        {/* Mode tabs */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/10 backdrop-blur-sm">
          {(['login', 'register'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                mode === m
                  ? 'bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/20'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-semibold text-center backdrop-blur-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
          {/* Name (register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-white/70 mb-2 ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  autoComplete="name"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-[20px] text-sm text-white font-medium placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all backdrop-blur-md"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2 ml-1">Email</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-[20px] text-sm text-white font-medium placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all backdrop-blur-md"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2 ml-1">Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-[20px] text-sm text-white font-medium placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all backdrop-blur-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 cursor-pointer transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Options row */}
          <div className="flex items-center justify-between px-1 mt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative inline-block w-8 h-4 align-middle select-none">
                <input type="checkbox" className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-2 border-white/20 appearance-none cursor-pointer transition-all duration-300" />
                <label className="toggle-label block overflow-hidden h-4 rounded-full bg-white/10 cursor-pointer transition-colors duration-300"></label>
              </div>
              <span className="text-[11px] text-white/60 font-medium group-hover:text-white/90 transition-colors">Remember me</span>
            </label>
            <button type="button" className="text-[11px] text-white/60 font-medium hover:text-[#FF6B00] transition-colors">
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-4 bg-gradient-to-r from-[#FF8C00] to-[#FF5500] hover:from-[#FF9A1A] hover:to-[#FF6B00] active:scale-[0.98] disabled:opacity-50 text-white font-bold rounded-[20px] text-sm transition-all shadow-lg shadow-[#FF6B00]/20 flex items-center justify-center gap-2 cursor-pointer border border-white/10"
          >
            {loading
              ? <Loader2 size={18} className="animate-spin" />
              : mode === 'login' ? 'Log in' : 'Sign up'
            }
          </button>
        </form>

        {/* Divider + Demo */}
        <div className="mt-8 mb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[10px] text-white/40 font-medium">or continue with</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="flex-1 py-3.5 bg-white/5 border border-white/10 rounded-[16px] text-xs font-semibold text-white/80 hover:bg-white/10 transition-all cursor-pointer backdrop-blur-md flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} className="text-[#FF6B00]" />
              Demo Account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
