import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store';
import { apiClient } from '../api/client';
import { Card, PillButton, RiskTag, DisclosureNote } from '../components/DesignSystem';
import { t } from '../data/i18n';
import { formatINRFull } from '../utils/format';
import { ChevronDown, ChevronUp, Check, ShieldCheck, Calculator, FileText, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RiskProfileType } from '../types';

export function PlanScreen() {
  const navigate = useNavigate();
  const lang = useAppStore(state => state.language);
  const user = useAppStore(state => state.user);
  const queryClient = useQueryClient();

  const [expandedRationale, setExpandedRationale] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basket' | 'goals' | 'report'>('basket');
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleCopyReport = () => {
    if (reportText) {
      navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // SIP Calculator State
  const [sipMonthly, setSipMonthly] = useState(10000);
  const [sipYears, setSipYears] = useState(10);

  const { data: summary } = useQuery({
    queryKey: ['financialSummary'],
    queryFn: async () => {
      const res = await apiClient.get('/transactions/summary');
      return res.data;
    },
    staleTime: 5 * 60 * 1000
  });

  const surplus = summary?.investableSurplus || 25000;

  const { data: latestRisk } = useQuery({
    queryKey: ['latestRisk'],
    queryFn: async () => {
      const res = await apiClient.get('/risk/latest');
      return res.data;
    },
    staleTime: 10 * 60 * 1000
  });
  const riskProfile: RiskProfileType = latestRisk?.profile || 'Moderate';

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await apiClient.get('/goals');
      return res.data;
    },
    staleTime: 5 * 60 * 1000
  });

  const { data: portfolio, isLoading, isError } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      // Get the current plan
      const res = await apiClient.get('/recommendations/current');
      return res.data; // Can be null if not generated yet
    }
  });

  const triggerReportDownload = () => {
    const pdfUrl = '/ArthAI_Portfolio_Advisory_Plan.pdf';
    // Open in new tab for viewing
    window.open(pdfUrl, '_blank');
    
    // Trigger download
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = 'ArthAI_Portfolio_Advisory_Plan.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const { data: reportText } = useQuery({
    queryKey: ['advisoryReportText', portfolio?.id],
    queryFn: async () => {
      const res = await apiClient.get('/reports/summary');
      return res.data;
    },
    enabled: !!portfolio
  });

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/recommendations/generate', { surplus });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    }
  });

  const consentMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/recommendations/consent', { portfolioId: portfolio.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      setShowConsentModal(false);
    }
  });

  const { data: simulation } = useQuery({
    queryKey: ['simulator', sipMonthly, sipYears, riskProfile],
    queryFn: async () => {
      const res = await apiClient.post('/simulator', {
        sipMonthly,
        sipYears,
        riskProfile
      });
      return res.data;
    }
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await apiClient.get('/profile/settings');
      return res.data;
    }
  });

  if (isLoading || generatePlanMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] space-y-4">
        <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Building your portfolio...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] space-y-4">
        <p className="text-rose-500 font-bold">Failed to load portfolio.</p>
        <button onClick={() => window.location.reload()} className="text-[#003366] font-bold underline">Retry</button>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] space-y-4 p-6 text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center mb-4">
          <Calculator size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your Custom Plan is Ready to Generate</h2>
        <p className="text-sm text-gray-600 mb-6">Based on your risk profile ({riskProfile}) and investable surplus ({formatINRFull(surplus)}).</p>
        <PillButton 
          onClick={() => {
            triggerReportDownload();
            generatePlanMutation.mutate();
          }} 
          arrow 
          className="w-full text-sm font-bold shadow-md"
        >
          Generate Advisory Plan
        </PillButton>
      </div>
    );
  }

  const handleSetupPlan = () => {
    consentMutation.mutate();
  };

  const allocations = portfolio.items || [];
  const planConsented = portfolio.status === 'Consented';

  const investedTotal = simulation?.investedTotal || (sipMonthly * sipYears * 12);
  const futureWealth = simulation?.futureWealth || Math.round(sipMonthly * ((Math.pow(1 + 0.12 / 12, sipYears * 12) - 1) / (0.12 / 12)) * (1 + 0.12 / 12));
  const cagr = simulation?.cagr || 12;

  const showAssumptions = settings?.show_planning_assumptions ?? true;

  return (
    <div className="screen-enter px-4 py-4 pb-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">
          {t('plan.header', lang)}
        </h1>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
          <RiskTag profile={riskProfile} small />
          <span className="font-medium">{t(`risk.${riskProfile}`, lang)}</span>
          <span>•</span>
          <span className="text-emerald-700 font-bold">{formatINRFull(surplus)} Surplus</span>
        </div>
      </div>

      {/* Advisory vs Execution distinction banner */}
      {showAssumptions && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-blue-900">
            <ShieldCheck size={16} className="text-[#003366]" />
            <span className="text-xs font-bold uppercase tracking-wider">SEBI Compliance Mode: Advisory Only</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white p-2 rounded-xl border border-blue-100">
              <p className="font-bold text-blue-900">✓ Advisory Guidance</p>
              <p className="text-gray-600 mt-0.5">{t('plan.advisory', lang)}</p>
            </div>
            <div className="bg-white p-2 rounded-xl border border-blue-100">
              <p className="font-bold text-gray-800">🔒 Direct Execution</p>
              <p className="text-gray-500 mt-0.5">{t('plan.execution', lang)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Toggle View */}
      <div className="flex bg-gray-200 p-1 rounded-xl text-[10px] font-bold gap-1">
        <button 
          onClick={() => setActiveTab('basket')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'basket' ? 'bg-white text-[#003366] shadow-xs' : 'text-gray-600'}`}
        >
          Basket Allocation
        </button>
        <button 
          onClick={() => setActiveTab('goals')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'goals' ? 'bg-white text-[#003366] shadow-xs' : 'text-gray-600'}`}
        >
          Goal Feasibility
        </button>
        <button 
          onClick={() => setActiveTab('report')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'report' ? 'bg-white text-[#003366] shadow-xs' : 'text-gray-600'}`}
        >
          Advisory Report
        </button>
      </div>

      {activeTab === 'goals' ? (
        <div className="space-y-4">
          {goals && goals.length > 0 ? (
            <Card className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Goal Feasibility Mapping</h3>
              <div className="space-y-3">
                {goals.map((goal: any) => (
                  <div key={goal.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-gray-900">{goal.name}</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        {goal.monthsRemaining} Months Left
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-600 mb-2">
                      <span>Target: {formatINRFull(goal.target)}</span>
                      <span>Gap: {formatINRFull(goal.gap)}</span>
                    </div>
                    <div className={`p-2 rounded-lg border flex justify-between items-center ${
                      goal.requiredMonthlyContribution <= surplus ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                    }`}>
                      <span className="text-[10px] font-medium text-gray-700">Required Monthly SIP:</span>
                      <span className={`text-xs font-black ${
                        goal.requiredMonthlyContribution <= surplus ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {formatINRFull(goal.requiredMonthlyContribution)}
                      </span>
                    </div>
                    {goal.requiredMonthlyContribution > surplus && (
                      <p className="text-[9px] text-rose-600 font-medium mt-1.5 leading-snug">
                        ⚠️ Your required contribution exceeds your available investable surplus ({formatINRFull(surplus)}). Consider adjusting the target or timeline.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="text-center p-6">
              <p className="text-sm text-gray-600 font-medium">No active goals mapped yet.</p>
              <button onClick={() => navigate('/home')} className="mt-2 text-xs font-bold text-[#003366] hover:underline cursor-pointer">
                Add goals from dashboard
              </button>
            </Card>
          )}

          <Card className="space-y-3">
            <div className="flex items-center gap-2">
              <Calculator size={18} className="text-[#FF6B00]" />
              <h3 className="text-sm font-bold text-gray-900">Interactive SIP Wealth Calculator</h3>
            </div>
          
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Monthly SIP: {formatINRFull(sipMonthly)}</span>
                <span className="text-[#FF6B00]">{cagr}% CAGR {showAssumptions && <span className="text-[9px] text-gray-500 font-normal">(Assumption)</span>}</span>
              </div>
              <input 
                type="range" 
                min="1000" 
                max="50000" 
                step="1000"
                value={sipMonthly}
                onChange={e => setSipMonthly(Number(e.target.value))}
                className="w-full accent-[#FF6B00] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Duration: {sipYears} Years</span>
                <span className="text-gray-500">{sipYears * 12} Installments</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="30" 
                value={sipYears}
                onChange={e => setSipYears(Number(e.target.value))}
                className="w-full accent-[#003366] cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-gray-200 grid grid-cols-2 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg">
                <p className="text-[10px] text-gray-500 font-medium">Total Invested</p>
                <p className="text-xs font-bold text-gray-900">{formatINRFull(investedTotal)}</p>
              </div>
              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <p className="text-[10px] text-emerald-800 font-medium">Projected Corpus</p>
                <p className="text-sm font-black text-emerald-700">{formatINRFull(futureWealth)}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      ) : activeTab === 'report' ? (
        <Card className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-gray-900">Generated Advisory Report</h3>
            <div className="flex gap-1.5">
              <button 
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 border border-gray-300 px-3 py-1 rounded-full hover:bg-gray-50 cursor-pointer"
              >
                {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button 
                onClick={triggerReportDownload}
                className="flex items-center gap-1.5 text-[10px] font-bold text-[#FF6B00] border border-[#FF6B00]/30 px-3 py-1 rounded-full hover:bg-orange-50 cursor-pointer"
              >
                <FileText size={12} /> Download (.md)
              </button>
            </div>
          </div>
          <div className="pt-1">
            <MarkdownViewer text={reportText} />
          </div>
        </Card>
      ) : (
        <>
          {/* Recommended Basket */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">{t('plan.allocation', lang)}</h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Allocated
              </span>
            </div>

            <div className="space-y-3">
              {allocations.map((alloc: any) => {
                const product = alloc.product;
                if (!product) return null;
                const expanded = expandedRationale === alloc.productId;

                return (
                  <div key={alloc.productId} className="border border-gray-200 rounded-xl p-3 bg-white hover:border-blue-300 transition-all shadow-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-gray-900">{product.name}</h4>
                          <span className="text-[9px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded">
                            {alloc.percentage}%
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                          {product.category} · Return: {product.expectedReturn}
                        </p>
                      </div>
                      <span className="text-xs font-black text-gray-900">{formatINRFull(alloc.amount)}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <Check size={11} /> SEBI Suitable
                          </span>
                      </div>

                      <button 
                        onClick={() => setExpandedRationale(expanded ? null : alloc.productId)}
                        className="flex items-center gap-1 text-[10px] font-bold text-[#003366] hover:underline cursor-pointer"
                      >
                        {t('plan.whyThis', lang)}
                        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>

                    {expanded && (
                      <div className="mt-2.5 p-2.5 bg-gray-50 rounded-lg text-[11px] text-gray-700 leading-relaxed chat-enter border border-gray-200">
                        <p className="font-medium">{alloc.rationale}</p>
                        <DisclosureNote text={product.disclosure} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5">
        <PillButton 
          variant="outline" 
          className="w-full text-sm font-bold shadow-xs border border-gray-300 bg-white" 
          onClick={triggerReportDownload}
        >
          <FileText size={16} className="text-[#003366]" /> Download Advisory Report
        </PillButton>

        {!planConsented ? (
          <PillButton 
            variant="secondary" 
            arrow 
            className="w-full text-sm font-bold shadow-md" 
            onClick={() => setShowConsentModal(true)}
          >
            {t('btn.setupPlan', lang)}
          </PillButton>
        ) : (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 shadow-xs">
            <Check size={16} className="text-emerald-600" /> Allocation Intent Logged into Compliance Trail
          </div>
        )}
      </div>

      <DisclosureNote text={t('general.disclosure', lang)} />

      {/* Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setShowConsentModal(false)}>
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 border border-gray-100" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-[#003366]">
              <ShieldCheck size={22} className="text-[#FF6B00]" />
              <h3 className="text-base font-bold tracking-tight">Digital Consent Verification</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Before storing your allocation intent, please verify that you have reviewed all risk disclosures and suitability matches.
            </p>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-700 space-y-1">
              <p><strong>Account:</strong> {user?.email}</p>
              <p><strong>Allocated Surplus:</strong> {formatINRFull(surplus)}/month</p>
              <p><strong>Investor Risk Profile:</strong> {riskProfile}</p>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input 
                type="checkbox" 
                checked={consentChecked} 
                onChange={e => setConsentChecked(e.target.checked)} 
                className="w-4 h-4 mt-0.5 accent-[#003366] cursor-pointer" 
              />
              <span className="text-xs text-gray-700 font-medium leading-normal">{t('plan.consent', lang)}</span>
            </label>

            <div className="flex gap-2 pt-1">
              <button 
                onClick={() => setShowConsentModal(false)} 
                className="flex-1 py-3 text-xs font-bold text-gray-500 rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <PillButton 
                disabled={!consentChecked || consentMutation.isPending} 
                onClick={handleSetupPlan} 
                className="flex-1 text-xs font-bold"
              >
                Sign & Authorize
              </PillButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MarkdownViewer({ text }: { text: string | undefined }) {
  if (!text) return <p className="text-gray-500 text-xs py-4 text-center font-medium">Loading report content...</p>;

  const lines = text.split('\n');
  return (
    <div className="space-y-2.5 text-[11px] leading-relaxed text-gray-700 font-medium">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('# ')) {
          return <h1 key={idx} className="text-sm font-extrabold text-[#003366] border-b border-gray-100 pb-1 mt-3">{trimmed.replace('# ', '')}</h1>;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={idx} className="text-xs font-bold text-gray-900 mt-3 mb-1">{trimmed.replace('## ', '')}</h2>;
        }
        if (trimmed.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-1.5 ml-1 my-0.5">
              <span className="text-[#FF6B00] mt-0.5 shrink-0">•</span>
              <span>{trimmed.replace('- ', '')}</span>
            </div>
          );
        }
        if (trimmed.startsWith('---')) {
          return <hr key={idx} className="border-gray-100 my-2" />;
        }
        if (trimmed === '') return null;
        return <p key={idx} className="text-gray-600">{trimmed}</p>;
      })}
    </div>
  );
}
