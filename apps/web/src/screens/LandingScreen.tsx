import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../logo.png';

export function LandingScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-b from-[#001730] to-[#000d1a] text-white relative overflow-hidden font-sans">
      
      {/* Dynamic Glow Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      {/* 3D Floating INR Symbols */}
      <div className="absolute top-[25%] left-[12%] text-[#FF6B00] font-black text-7xl opacity-40 drop-shadow-[0_15px_15px_rgba(255,107,0,0.4)] transform -rotate-12 animate-pulse" style={{ animationDuration: '5s' }}>₹</div>
      <div className="absolute top-[35%] right-[10%] text-[#0066cc] font-black text-8xl opacity-30 drop-shadow-[0_20px_20px_rgba(0,102,204,0.3)] transform rotate-12 animate-pulse" style={{ animationDuration: '7s' }}>₹</div>
      <div className="absolute bottom-[40%] left-[25%] text-white font-black text-5xl opacity-20 drop-shadow-[0_10px_10px_rgba(255,255,255,0.3)] transform rotate-45 animate-pulse" style={{ animationDuration: '6s' }}>₹</div>

      {/* Background Animated Arrows */}
      <div className="arrow-container">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="moving-arrow" 
            style={{ 
              animationDelay: `-${Math.random() * 8}s`, 
              animationDuration: `${Math.random() * 4 + 6}s`,
              height: `${Math.random() * 250 + 150}px`,
              opacity: Math.random() * 0.5 + 0.3
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            <div className="arrow-tail" style={{ height: '100%' }} />
          </div>
        ))}
      </div>

      <div className="absolute top-12 left-0 right-0 flex flex-col items-center justify-center z-10">
        <div className="w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/20 border-b-white/5 border-r-white/5 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-2.5 overflow-hidden mb-4">
          <img src={logoImg} alt="Arth AI Logo" className="w-full h-full object-contain drop-shadow-lg" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-1 drop-shadow-md">Arth AI</h1>
        <p className="text-white/70 text-[15px] font-medium tracking-wide drop-shadow text-center px-4">
          Your personal financial advisor
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-end px-6 pb-10 z-10 relative">
        <div className="bg-white/5 border border-white/20 border-b-white/5 border-r-white/5 rounded-[32px] p-8 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-center relative overflow-hidden">
          {/* subtle inner shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
          <h2 className="text-2xl font-bold tracking-tight mb-4 text-white">Welcome to the world of Finance</h2>
          <p className="text-white/60 text-[13px] font-medium leading-relaxed mb-8 px-2">
            Invest in projects that make a difference. Join us in supporting impactful initiatives and create
          </p>

          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/login')}
              className="text-white/50 hover:text-white/90 text-sm font-bold pl-2 cursor-pointer transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 bg-gradient-to-r from-[#FF8C00] to-[#FF5500] hover:from-[#FF9A1A] hover:to-[#FF6B00] active:scale-[0.98] text-white font-bold rounded-[20px] text-sm transition-all shadow-lg shadow-[#FF6B00]/20 cursor-pointer border border-white/10"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
