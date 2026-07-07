import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAppStore } from '../store';
import { apiClient } from '../api/client';
import { AvatarBubble, ChatBubble, Chip, PillButton, Card, RiskTag, DisclosureNote } from '../components/DesignSystem';
import { t } from '../data/i18n';
import { ShieldCheck } from 'lucide-react';
import type { RiskProfileType } from '../types';

// Mirror of backend scoring — computes result instantly on the client
function computeRiskLocally(answers: Record<string, string>, questions: any[]) {
  let total = 0;
  for (const q of questions) {
    const opt = q.options.find((o: any) => o.value === answers[q.id]);
    if (opt) total += opt.points;
  }
  const profile: RiskProfileType = total <= 10 ? 'Conservative' : total <= 18 ? 'Moderate' : 'Aggressive';
  return { score: total, profile };
}

export function OnboardingRisk() {
  const navigate = useNavigate();
  const lang = useAppStore(state => state.language);
  const [step, setStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [assessmentResult, setAssessmentResult] = useState<{ profile: RiskProfileType; score: number } | null>(null);

  const { data: riskQuestions = [] } = useQuery({
    queryKey: ['riskQuestions'],
    queryFn: async () => {
      const res = await apiClient.get('/risk/questions');
      return res.data;
    }
  });

  const submitRiskMutation = useMutation({
    mutationFn: async (finalAnswers: Record<string, string>) => {
      const res = await apiClient.post('/risk/submit', { answers: finalAnswers });
      return res.data;
    },
    onSuccess: (data) => {
      setAssessmentResult({ profile: data.profile, score: data.score });
      setTimeout(() => setShowResult(true), 350);
    }
  });

  const answeredQuestions = riskQuestions.slice(0, step + 1);
  const allAnswered = riskQuestions.length > 0 && Object.keys(answers).length >= riskQuestions.length;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [step, showResult, answers]);

  const handleAnswer = (qId: string, value: string) => {
    const newAnswers = { ...answers, [qId]: value };
    setAnswers(newAnswers);
    
    if (step < riskQuestions.length - 1) {
      setTimeout(() => setStep(step + 1), 250);
    } else {
      // ✅ Compute result INSTANTLY on client — no waiting for API
      const localResult = computeRiskLocally(newAnswers, riskQuestions);
      setAssessmentResult(localResult);
      setTimeout(() => setShowResult(true), 350);

      // Save to backend in background (fire-and-forget)
      submitRiskMutation.mutate(newAnswers);
    }
  };

  const handleContinue = () => {
    // In a real app we'd save consent. The risk API already creates the assessment.
    navigate('/home');
  };

  if (!riskQuestions.length) return <div className="p-8 text-center text-white">Loading...</div>;

  return (
    <div ref={scrollRef} className="screen-enter flex flex-col h-full overflow-y-auto phone-scroll bg-[#F4F6F9]">
      {/* Sticky Header */}
      <div className="flex flex-col items-center pt-3 pb-2 px-4 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-xs">
        <AvatarBubble size="small" speaking={!allAnswered && !showResult} />
        <h2 className="text-xs font-bold text-gray-800 mt-1">{t('risk.title', lang)}</h2>
        <div className="flex gap-1 mt-1">
          {riskQuestions.map((_: any, idx: number) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all ${idx <= step ? 'w-5 bg-[#003366]' : 'w-2 bg-gray-200'}`} 
            />
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 px-3 py-3">
        {answeredQuestions.map((q: any, qi: number) => (
          <div key={q.id}>
            <ChatBubble sender="arthai">
              {t(q.key, lang)}
            </ChatBubble>

            {answers[q.id] ? (
              <ChatBubble sender="user">
                {t(q.options.find((o: any) => o.value === answers[q.id])?.key || '', lang)}
              </ChatBubble>
            ) : qi === step ? (
              <div className="flex flex-wrap gap-1.5 mb-4 ml-2 chat-enter">
                {q.options.map((opt: any) => (
                  <Chip key={opt.value} onClick={() => handleAnswer(q.id, opt.value)}>
                    {t(opt.key, lang)}
                  </Chip>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        {/* Result Card */}
        {showResult && assessmentResult && (
          <div className="chat-enter mt-4 mb-4">
            <Card className="border-2 border-[#003366]/30 shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center gap-1 text-xs text-gray-500 font-semibold mb-1">
                  <ShieldCheck size={14} className="text-emerald-600" /> SEBI Risk Classification
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">
                    {t(`risk.${assessmentResult.profile}`, lang)}
                  </h2>
                  <RiskTag profile={assessmentResult.profile} />
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-4 p-2 bg-gray-50 rounded-xl border border-gray-100 font-medium">
                  {t(`risk.explain${assessmentResult.profile}`, lang)}
                </p>

                {/* Contributing factors */}
                <div className="text-left mb-4 bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <p className="text-[10px] font-bold text-[#003366] mb-1.5 uppercase tracking-wider">Scoring Breakdown</p>
                  {riskQuestions.map((q: any) => {
                    const ansVal = answers[q.id];
                    const opt = q.options.find((o: any) => o.value === ansVal);
                    return opt ? (
                      <div key={q.id} className="flex justify-between text-[11px] text-gray-600 py-0.5 border-b border-gray-100 last:border-0">
                        <span>{t(q.key, lang).replace('?', '')}</span>
                        <span className="font-semibold text-gray-900">{t(opt.key, lang)}</span>
                      </div>
                    ) : null;
                  })}
                </div>

                {/* Regulatory Consent */}
                <label className="flex items-start gap-2.5 p-3 bg-blue-50/70 border border-blue-200 rounded-xl cursor-pointer mb-4 text-left">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={e => setConsentChecked(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-[#003366] cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-blue-900 font-semibold leading-tight">{t('risk.consent', lang)}</span>
                </label>

                <PillButton arrow disabled={!consentChecked} onClick={handleContinue} className="w-full font-bold shadow-md">
                  {t('btn.continue', lang)}
                </PillButton>
              </div>
            </Card>
            <DisclosureNote text={t('ai.disclosure', lang)} />
          </div>
        )}
      </div>
    </div>
  );
}
