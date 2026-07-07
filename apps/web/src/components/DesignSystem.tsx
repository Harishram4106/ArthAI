import React, { ReactNode } from 'react';
import { Signal, Wifi, Battery, LayoutDashboard, Sparkles, Target, ScrollText, ArrowRight, ShieldCheck, Maximize2, Minimize2, RotateCcw, Building2 } from 'lucide-react';
import { t } from '../data/i18n';
import type { Tab, RiskProfileType } from '../types';
import { useAppStore } from '../store';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../logo.png';

// ── StatusBar ──
export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 py-2 bg-[#002B54] text-white select-none">
      <span className="text-xs font-semibold tracking-tight">9:41</span>
      <div className="flex items-center gap-1.5 opacity-90">
        <Signal size={12} />
        <Wifi size={12} />
        <Battery size={13} />
      </div>
    </div>
  );
}

// ── IDBI Bank Header ──
export function IDBIHeader() {
  const navigate = useNavigate();
  return (
    <div className="glass-header text-white px-4 py-3 shadow-md flex items-center justify-between sticky top-0 z-30 pt-safe">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shadow-inner shrink-0">
          <div className="w-full h-full bg-[#003366] rounded flex items-center justify-center font-black text-[11px] text-[#FF6B00] tracking-tighter">
            IDBI
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight">IDBI MobileBanking</span>
            <span className="text-[9px] bg-[#FF6B00] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
              ArthAI
            </span>
          </div>
          <p className="text-[10px] text-white/70 font-medium">IDBI Wealth Advisor</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate('/profile')}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 transition-colors cursor-pointer"
          title="Account Profile"
        >
          <Building2 size={16} />
        </button>
      </div>
    </div>
  );
}

// ── PhoneFrame ──
export function PhoneFrame({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isAuthScreen = location.pathname.includes('login') || 
    location.pathname === '/' ||
    location.pathname.includes('auth/callback') ||
    location.pathname.includes('onboarding');
  // Onboarding screens use a different light bg, not dark navy
  const isOnboarding = location.pathname.includes('onboarding');
  
  // Always desktop preview mode for now
  const isPhoneMode = false;

  // REAL MOBILE APP MODE: Clean 100% full screen application
  if (!isPhoneMode) {
    const outerBg = isOnboarding ? 'bg-[#F4F6F9]' : isAuthScreen ? 'bg-[#001f3f]' : 'bg-[#F4F6F9]';
    const innerClass = isAuthScreen && !isOnboarding
      ? 'border-x border-white/10'
      : 'liquid-bg border-x border-white/40';
    const contentClass = isAuthScreen && !isOnboarding
      ? 'flex-1 overflow-hidden flex flex-col'
      : 'flex-1 overflow-y-auto phone-scroll pb-20';

    return (
      <div className={`min-h-screen h-screen w-full flex flex-col relative overflow-x-hidden ${outerBg}`}>
        <div className={`w-full max-w-md mx-auto flex flex-col relative shadow-xl h-full ${innerClass}`}>
          {!isAuthScreen && <IDBIHeader />}
          <div className={`relative ${contentClass}`}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  // DESKTOP PREVIEW MODE: Optional phone mockup container
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-2 sm:p-6 relative overflow-x-hidden"
         style={{ backgroundImage: 'radial-gradient(circle at 50% 20%, #161b22 0%, #0d1117 100%)' }}>
      
      <div className="mb-3 flex items-center gap-3 bg-[#161b22]/90 backdrop-blur border border-white/10 px-4 py-2 rounded-full shadow-lg text-xs text-white/80 z-20">
        <span className="flex items-center gap-1.5 font-semibold text-[#FF6B00]">
          <ShieldCheck size={14} /> IDBI ArthAI Wealth Advisor
        </span>
        <span className="text-white/20">|</span>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
          className="flex items-center gap-1 text-white/60 hover:text-red-400 transition-colors cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>Reset Demo</span>
        </button>
      </div>

      <div className="w-full max-w-sm bg-black rounded-[44px] p-3 shadow-2xl border-4 border-[#22272e]" style={{ height: 844 }}>
        <div className="bg-[#F4F6F9] rounded-[34px] overflow-hidden flex flex-col h-full relative border border-white/20">
          <StatusBar />
          {!isAuthScreen && <IDBIHeader />}
          <div className={`flex-1 overflow-y-auto phone-scroll relative ${isAuthScreen ? '' : 'pb-16'}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Card ──
export function Card({ children, className = '', style, onClick }: { children: ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      style={style}
      className={`glass-card rounded-2xl p-4 ${onClick ? 'cursor-pointer hover:bg-white/80 transition-all' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// ── DarkCard ──
export function DarkCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`gradient-idbi-card text-white rounded-2xl p-4 shadow-[0_6px_20px_rgba(0,51,102,0.25)] border border-white/10 ${className}`}>
      {children}
    </div>
  );
}

// ── PillButton ──
export function PillButton({ children, onClick, disabled = false, arrow = false, className = '', variant = 'primary', type = 'button' }: {
  children: ReactNode; onClick?: () => void; disabled?: boolean; arrow?: boolean; className?: string; variant?: 'primary' | 'secondary' | 'outline'; type?: 'button' | 'submit' | 'reset';
}) {
  const bgStyles = variant === 'primary' 
    ? 'bg-[#003366] hover:bg-[#002850] text-white shadow-md shadow-[#003366]/20' 
    : variant === 'secondary' 
    ? 'bg-[#FF6B00] hover:bg-[#E56000] text-white shadow-md shadow-[#FF6B00]/20'
    : 'bg-white hover:bg-gray-50 text-[#003366] border border-[#003366]/20';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${bgStyles} rounded-full font-semibold px-6 py-3.5 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 cursor-pointer text-sm ${className}`}
    >
      <span>{children}</span>
      {arrow && (
        <span className="bg-white/20 rounded-full p-1 flex items-center justify-center">
          <ArrowRight size={14} className="text-current" />
        </span>
      )}
    </button>
  );
}

// ── Chip ──
export function Chip({ children, active = false, onClick, className = '' }: {
  children: ReactNode; active?: boolean; onClick?: () => void; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 chip-press cursor-pointer ${
        active ? 'bg-[#003366] text-white shadow-sm' : 'glass-pill text-gray-700 hover:bg-white/80'
      } ${className}`}
    >
      {children}
    </button>
  );
}

// ── RiskTag ──
export function RiskTag({ profile, small = false }: { profile: RiskProfileType; small?: boolean }) {
  const language = useAppStore(state => state.language);
  if (!profile) return null;
  const colors: Record<string, string> = {
    Conservative: 'bg-blue-50 text-blue-800 border-blue-200',
    Moderate: 'bg-amber-50 text-amber-800 border-amber-200',
    Aggressive: 'bg-rose-50 text-rose-800 border-rose-200',
  };
  return (
    <span className={`inline-flex items-center border font-semibold rounded-full ${colors[profile]} ${small ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'}`}>
      {t(`risk.${profile}`, language)}
    </span>
  );
}

// ── DisclosureNote ──
export function DisclosureNote({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-1.5 mt-3 pt-2 border-t border-gray-100">
      <ShieldCheck size={12} className="text-gray-400 shrink-0 mt-0.5" />
      <p className="text-[10px] text-gray-400 leading-normal">
        {text}
      </p>
    </div>
  );
}

// ── AvatarBubble ──
export function AvatarBubble({ size = 'small', speaking = false }: { size?: 'small' | 'large'; speaking?: boolean }) {
  const dim = size === 'large' ? 'w-20 h-20' : 'w-10 h-10';
  return (
    <div className="flex flex-col items-center gap-1.5 relative">
      <div className="relative">
        <div className={`absolute -inset-1 rounded-full bg-[#FF6B00]/30 ${speaking ? 'pulse-ring' : ''}`} />
        <div className={`${dim} rounded-full avatar-breathe relative shadow-lg flex items-center justify-center border-2 border-white bg-white overflow-hidden`}>
          <div className="flex items-center justify-center w-full h-full p-1.5">
            {size === 'large' ? (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <img src={logoImg} alt="ArthAI Logo" className="w-12 h-12 object-contain" />
                <span className="text-[8px] tracking-wider uppercase font-extrabold text-[#003366] mt-0.5">ArthAI</span>
              </div>
            ) : (
              <img src={logoImg} alt="ArthAI Logo" className="w-full h-full object-contain" />
            )}
          </div>
        </div>
      </div>
      {speaking && (
        <div className="flex items-end gap-1 h-5 mt-1">
          <div className="w-1 bg-[#FF6B00] rounded-full wave-bar-1" />
          <div className="w-1 bg-[#003366] rounded-full wave-bar-2" />
          <div className="w-1 bg-[#FF6B00] rounded-full wave-bar-3" />
        </div>
      )}
    </div>
  );
}

// ── ChatBubble ──
export function ChatBubble({ sender, children }: { sender: 'arthai' | 'user'; children: ReactNode }) {
  return (
    <div className={`chat-enter flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
        sender === 'arthai'
          ? 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-xs'
          : 'bg-[#003366] text-white rounded-br-xs shadow-md'
      }`}>
        {children}
      </div>
    </div>
  );
}

// ── BottomTabBar ──
export function BottomTabBar() {
  const language = useAppStore(state => state.language);
  const navigate = useNavigate();
  const location = useLocation();

  const tabs: { id: Tab; icon: typeof LayoutDashboard; labelKey: string; path: string }[] = [
    { id: 'home', icon: LayoutDashboard, labelKey: 'tab.home', path: '/home' },
    { id: 'arthai', icon: Sparkles, labelKey: 'tab.arthai', path: '/arthai' },
    { id: 'plan', icon: Target, labelKey: 'tab.plan', path: '/plan' },
    { id: 'activity', icon: ScrollText, labelKey: 'tab.activity', path: '/activity' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-nav flex items-center justify-around py-2 pb-6 px-2 z-40 w-full max-w-md mx-auto">
      {tabs.map(tab => {
        const active = location.pathname.includes(tab.path);
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-1 px-3 py-1 transition-all duration-200 cursor-pointer relative ${
              active ? 'text-[#003366]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {active && (
              <span className="absolute -top-2 w-8 h-1 bg-[#FF6B00] rounded-full animate-pulse" />
            )}
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} className={active ? 'text-[#003366]' : ''} />
            <span className={`text-[10px] ${active ? 'font-bold text-[#003366]' : 'font-medium'}`}>
              {t(tab.labelKey, language)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
