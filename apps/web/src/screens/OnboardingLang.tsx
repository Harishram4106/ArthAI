import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { AvatarBubble, PillButton, Chip } from '../components/DesignSystem';
import { t } from '../data/i18n';
import type { Language } from '../types';
import { ShieldCheck, Sparkles } from 'lucide-react';

export function OnboardingLang() {
  const navigate = useNavigate();
  const lang = useAppStore(state => state.language);
  const setLanguage = useAppStore(state => state.setLanguage);

  const selectLang = (l: Language) => {
    setLanguage(l);
  };

  return (
    <div className="screen-enter flex flex-col items-center justify-between h-full px-6 py-8 text-center bg-[#F4F6F9]">
      <div className="w-full flex justify-center pt-4">
        <div className="inline-flex items-center gap-1.5 bg-[#003366]/10 px-3 py-1 rounded-full text-[11px] font-bold text-[#003366]">
          <Sparkles size={13} className="text-[#FF6B00]" /> IDBI Innovate 2026 Hackathon
        </div>
      </div>

      <div className="flex flex-col items-center max-w-xs my-auto">
        <AvatarBubble size="large" speaking={false} />

        <h1 className="text-xl font-black mt-5 mb-1 text-gray-900 tracking-tight">
          {lang === 'hi' ? 'नमस्ते!' : lang === 'ta' ? 'வணக்கம்!' : 'Namaste!'}
        </h1>
        <p className="text-xs font-bold text-[#003366] uppercase tracking-wider mb-4">IDBI Arth AI Wealth Advisor</p>

        <div className="flex gap-2 my-2">
          {(['en', 'hi', 'ta'] as Language[]).map(l => (
            <Chip key={l} active={lang === l} onClick={() => selectLang(l)}>
              {l === 'en' ? 'English' : l === 'hi' ? 'हिन्दी' : 'தமிழ்'}
            </Chip>
          ))}
        </div>

        <p className="text-xs text-gray-600 leading-relaxed my-4">
          {t('arthai.greeting', lang)}
        </p>

        <div className="p-3 bg-white rounded-2xl border border-gray-200 text-[10px] text-gray-500 leading-relaxed flex items-start gap-2 shadow-xs text-left">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <span>{t('ai.disclosure', lang)}</span>
        </div>
      </div>

      <div className="w-full pb-2">
        <PillButton arrow onClick={() => navigate('/onboarding-risk')} className="w-full font-bold shadow-md">
          {t('btn.letsBegin', lang)}
        </PillButton>
      </div>
    </div>
  );
}
