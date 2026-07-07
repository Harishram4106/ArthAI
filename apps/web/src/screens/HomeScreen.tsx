import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store';
import { apiClient } from '../api/client';
import { Card, DarkCard, PillButton, RiskTag, AvatarBubble, DisclosureNote } from '../components/DesignSystem';
import { t } from '../data/i18n';
import { formatINRFull } from '../utils/format';
import { TrendingUp, ArrowUpRight, PieChart, Wallet, Sparkles, CheckCircle2, Edit, Plus, Trash2, Target } from 'lucide-react';
import type { Language, RiskProfileType } from '../types';

export function HomeScreen() {
  const navigate = useNavigate();
  const lang = useAppStore(state => state.language);
  const setLanguage = useAppStore(state => state.setLanguage);
  const user = useAppStore(state => state.user);
  const queryClient = useQueryClient();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'All' | 'Discretionary'>('All');
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({
    avgMonthlyIncome: '',
    avgMonthlyExpense: '',
    investableSurplus: '',
    totalInvested: '',
    financialHealthScore: '',
    emergencyCoverageMonths: ''
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await apiClient.get('/profile/settings');
      return res.data;
    }
  });

  const updateOverridesMutation = useMutation({
    mutationFn: async (overrides: any) => {
      const newSettings = {
        ...settings,
        dashboardOverrides: overrides
      };
      await apiClient.patch('/profile/settings', newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setShowEditModal(false);
    }
  });

  const openEditModal = () => {
    if (summary) {
      setForm({
        avgMonthlyIncome: String(summary.avgMonthlyIncome || ''),
        avgMonthlyExpense: String(summary.avgMonthlyExpense || ''),
        investableSurplus: String(summary.investableSurplus || ''),
        totalInvested: String(summary.totalInvested || ''),
        financialHealthScore: String(summary.financialHealthScore || ''),
        emergencyCoverageMonths: String(summary.emergencyCoverageMonths || '')
      });
    }
    setShowEditModal(true);
  };

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    id: '',
    name: '',
    target: '',
    current: '',
    targetYear: '',
    category: 'Retirement'
  });

  const createGoalMutation = useMutation({
    mutationFn: async (newGoal: any) => {
      await apiClient.post('/goals', newGoal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
      setShowGoalModal(false);
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: async (updatedGoal: any) => {
      await apiClient.patch(`/goals/${updatedGoal.id}`, updatedGoal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
      setShowGoalModal(false);
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
      setShowGoalModal(false);
    }
  });

  const openAddGoalModal = () => {
    setGoalForm({
      id: '',
      name: '',
      target: '',
      current: '',
      targetYear: '2035',
      category: 'Retirement'
    });
    setShowGoalModal(true);
  };

  const openEditGoalModal = (goal: any) => {
    setGoalForm({
      id: goal.id,
      name: goal.name,
      target: String(goal.target),
      current: String(goal.current),
      targetYear: String(goal.targetYear),
      category: goal.category
    });
    setShowGoalModal(true);
  };


  const { data: summary, isError: isSummaryError } = useQuery({
    queryKey: ['financialSummary'],
    queryFn: async () => {
      const res = await apiClient.get('/transactions/summary');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: {
      totalInvested: 0, monthChange: 0, monthChangePct: 0,
      investableSurplus: 0, spendingByCategory: {}, healthScore: 0,
      healthBreakdown: null, totalIncome: 0, totalExpense: 0
    }
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await apiClient.get('/goals');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: []
  });

  const { data: latestRisk } = useQuery({
    queryKey: ['latestRisk'],
    queryFn: async () => {
      const res = await apiClient.get('/risk/latest');
      return res.data;
    },
    staleTime: 10 * 60 * 1000, // Risk profile changes rarely
    placeholderData: { profile: 'Moderate' }
  });

  // No full-screen loader: all queries have placeholderData so render is instant

  const derivedMetrics = summary ?? {};
  const riskProfile: RiskProfileType = latestRisk?.profile || 'Moderate';
  const totalInvested = derivedMetrics.totalInvested || 0;
  const monthChange = derivedMetrics.monthChange || 0;
  const monthChangePct = derivedMetrics.monthChangePct || 0;
  const spendingByCategory: Record<string, number> = derivedMetrics.spendingByCategory || {};

  const categoryOrder = ['Rent', 'Groceries', 'Dining', 'Shopping', 'Bills', 'Transport', 'Subscriptions', 'Misc'];
  const categoryValues = Object.values(spendingByCategory);
  const maxSpend = categoryValues.length > 0 ? Math.max(...categoryValues, 1) : 1;

  return (
    <div className="screen-enter px-4 py-4 pb-4 space-y-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              {t('home.greeting', lang)}, {user?.name?.split(' ')[0] ?? 'there'} 👋
            </h1>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs text-gray-500 font-medium">IDBI Savings A/c · {user?.email ?? ''}</p>
            <button 
              onClick={openEditModal} 
              className="p-1 rounded-md text-gray-400 hover:text-[#003366] hover:bg-gray-150 transition-all cursor-pointer"
              title="Edit Dashboard Values"
            >
              <Edit size={12} />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex bg-gray-200 p-0.5 rounded-full border border-gray-300">
            {(['en', 'hi', 'ta'] as Language[]).map(l => (
              <button 
                key={l} 
                onClick={() => setLanguage(l)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  lang === l ? 'bg-[#003366] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'த'}
              </button>
            ))}
          </div>
          <RiskTag profile={riskProfile} small />
        </div>
      </div>

      {/* Net Position Card */}
      <DarkCard>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-white/70 font-medium tracking-wide uppercase">{t('home.netPosition', lang)}</p>
          <span className="text-[10px] bg-white/10 text-white/90 px-2 py-0.5 rounded-full font-medium">IDBI Mutual Funds & FDs</span>
        </div>
        <p className="text-3xl font-black text-white tracking-tight mt-1">{formatINRFull(totalInvested)}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
              <TrendingUp size={14} />
            </span>
            <span className="text-xs text-emerald-400 font-bold">+{formatINRFull(monthChange)} (+{monthChangePct}%)</span>
            <span className="text-[10px] text-white/50">{t('home.thisMonth', lang)}</span>
          </div>
          <button 
            onClick={() => navigate('/plan')}
            className="text-xs text-[#FF6B00] font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            Details <ArrowUpRight size={13} />
          </button>
        </div>
      </DarkCard>

      {/* Financial Health Score Banner */}
      <Card className="border-2 border-blue-900/10">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-900 to-indigo-800 border-[3px] border-[#FF6B00] text-white font-black text-xl shadow-md">
            {derivedMetrics.financialHealthScore ?? derivedMetrics.healthScore ?? '--'}
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{t('home.healthScore', lang)}</h2>
            <p className="text-[11px] text-gray-500 font-medium leading-snug">
              Based on your savings rate, emergency fund, and goal progress.
            </p>
          </div>
        </div>
        
        {derivedMetrics.healthBreakdown && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'savingsRate', label: 'Savings Rate', data: derivedMetrics.healthBreakdown.savingsRate },
              { key: 'emergencyFund', label: 'Emergency Fund', data: derivedMetrics.healthBreakdown.emergencyFund },
              { key: 'expenseStability', label: 'Expense Stability', data: derivedMetrics.healthBreakdown.expenseStability },
              { key: 'goalReadiness', label: 'Goal Readiness', data: derivedMetrics.healthBreakdown.goalReadiness }
            ].map(item => (
              <div key={item.key} className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">{item.label}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${
                    item.data.status === 'Excellent' ? 'bg-emerald-100 text-emerald-700' :
                    item.data.status === 'Good' ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {item.data.status}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-black text-gray-900">{item.data.value}</span>
                  <span className="text-[10px] text-gray-400">/ {item.data.score} pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Spend Analyzer */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <PieChart size={16} className="text-[#003366]" />
            <h2 className="text-sm font-bold text-gray-900">{t('home.spendingInsights', lang)}</h2>
          </div>
          <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg text-[10px]">
            <button 
              onClick={() => setActiveCategoryFilter('All')}
              className={`px-2 py-0.5 rounded font-medium cursor-pointer ${activeCategoryFilter === 'All' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveCategoryFilter('Discretionary')}
              className={`px-2 py-0.5 rounded font-medium cursor-pointer ${activeCategoryFilter === 'Discretionary' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}`}
            >
              Lifestyle
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {categoryOrder.map(cat => {
            const amount = spendingByCategory[cat] || 0;
            const pct = (amount / maxSpend) * 100;
            const isDisc = ['Dining', 'Shopping', 'Subscriptions', 'Misc'].includes(cat);
            if (activeCategoryFilter === 'Discretionary' && !isDisc) return null;

            return (
              <div key={cat} className="flex items-center gap-2.5">
                <span className="text-[11px] font-medium text-gray-600 w-24 shrink-0 truncate">
                  {t(`cat.${cat}`, lang)}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isDisc ? 'bg-[#FF6B00]' : 'bg-[#003366]'}`} 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
                <span className="text-[11px] font-bold text-gray-800 w-16 text-right">{formatINRFull(amount)}</span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 text-xs font-semibold">
          <span className="text-emerald-700">Inflow: {formatINRFull(derivedMetrics.avgMonthlyIncome)}</span>
          <span className="text-rose-600">Outflow: {formatINRFull(derivedMetrics.avgMonthlyExpense)}</span>
        </div>
      </Card>

      {/* Investable Surplus Banner */}
      <Card className="border-2 border-emerald-500/30 gradient-surplus-card relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Wallet size={16} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">{t('home.investable', lang)}</span>
            </div>
            <p className="text-3xl font-black text-emerald-600 tracking-tight mt-1">
              {formatINRFull(derivedMetrics.investableSurplus)}
            </p>
            <p className="text-[11px] text-gray-600 font-medium mt-1">
              {t('home.investableSubline', lang)}
            </p>
          </div>
        </div>
        <PillButton 
          variant="secondary"
          arrow 
          className="w-full mt-3 text-sm font-bold shadow-md" 
          onClick={() => navigate('/plan')}
        >
          {t('btn.seePlan', lang)}
        </PillButton>
      </Card>

      {/* Goals Progress */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900">{t('home.goals', lang)}</h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-medium">{goals.length} Active Goals</span>
            <button 
              onClick={openAddGoalModal}
              className="p-1 bg-[#003366]/10 text-[#003366] hover:bg-[#003366]/20 rounded-lg transition-all cursor-pointer"
              title="Add New Goal"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
        <div className="space-y-3.5">
          {goals.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4 font-semibold">No active goals. Click the + button above to add one.</p>
          ) : goals.map((goal: any) => {
            const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
            const statusColor = goal.status === 'On track' 
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
              : goal.status === 'Building' 
              ? 'text-amber-700 bg-amber-50 border-amber-200' 
              : 'text-rose-700 bg-rose-50 border-rose-200';

            return (
              <div 
                key={goal.id} 
                onClick={() => openEditGoalModal(goal)}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 cursor-pointer transition-all active:scale-[0.99]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-800">{t(`goal.${goal.name}`, lang) || goal.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                    {t(`status.${goal.status}`, lang) || goal.status}
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden mb-1.5">
                  <div 
                    className="h-full rounded-full transition-all duration-700" 
                    style={{
                      width: `${pct}%`,
                      background: goal.status === 'On track' ? '#0E9F6E' : goal.status === 'Building' ? '#D97706' : '#EF4444'
                    }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                  <span>Saved: {formatINRFull(goal.current)}</span>
                  <span>Target: {formatINRFull(goal.target)} ({goal.targetYear})</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Floating Action / Talk to Arth AI */}
      <div className="pt-1">
        <button 
          onClick={() => navigate('/arthai')}
          className="w-full gradient-idbi-header text-white rounded-2xl p-4 shadow-lg flex items-center justify-between hover:opacity-95 transition-all cursor-pointer border border-white/10"
        >
          <div className="flex items-center gap-3">
            <AvatarBubble size="small" />
            <div className="text-left">
              <p className="text-xs text-[#FF6B00] font-bold uppercase tracking-wider">AI Wealth Assistant</p>
              <p className="text-sm font-bold text-white">Have financial questions? Ask ArthAI</p>
            </div>
          </div>
          <span className="p-2 bg-white/10 rounded-full text-white">
            <Sparkles size={18} />
          </span>
        </button>
      </div>

      <DisclosureNote text={t('general.disclosure', lang)} />

      {/* Edit Dashboard Values Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 border border-gray-100 text-gray-900" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-[#003366]">
              <Edit size={20} className="text-[#FF6B00]" />
              <h3 className="text-base font-bold tracking-tight">Edit Dashboard Values</h3>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              updateOverridesMutation.mutate({
                avgMonthlyIncome: Number(form.avgMonthlyIncome),
                avgMonthlyExpense: Number(form.avgMonthlyExpense),
                investableSurplus: Number(form.investableSurplus),
                totalInvested: Number(form.totalInvested),
                financialHealthScore: Number(form.financialHealthScore),
                emergencyCoverageMonths: Number(form.emergencyCoverageMonths)
              });
            }} className="space-y-3.5">
              
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Monthly Income (₹)</label>
                  <input
                    type="number"
                    value={form.avgMonthlyIncome}
                    onChange={e => setForm({ ...form, avgMonthlyIncome: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Monthly Expense (₹)</label>
                  <input
                    type="number"
                    value={form.avgMonthlyExpense}
                    onChange={e => setForm({ ...form, avgMonthlyExpense: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Investable Surplus (₹)</label>
                  <input
                    type="number"
                    value={form.investableSurplus}
                    onChange={e => setForm({ ...form, investableSurplus: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Net Position (₹)</label>
                  <input
                    type="number"
                    value={form.totalInvested}
                    onChange={e => setForm({ ...form, totalInvested: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Health Score (1-100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={form.financialHealthScore}
                    onChange={e => setForm({ ...form, financialHealthScore: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Emergency Fund (x)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.emergencyCoverageMonths}
                    onChange={e => setForm({ ...form, emergencyCoverageMonths: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-500 rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateOverridesMutation.isPending}
                  className="flex-1 py-2.5 bg-[#003366] text-white text-xs font-bold rounded-full hover:bg-[#002B54] transition-all cursor-pointer shadow-md"
                >
                  {updateOverridesMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Goal Modal (Add / Edit) */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setShowGoalModal(false)}>
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 border border-gray-100 text-gray-900" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#003366]">
                <Target size={20} className="text-[#FF6B00]" />
                <h3 className="text-base font-bold tracking-tight">
                  {goalForm.id ? 'Edit Financial Goal' : 'Add Financial Goal'}
                </h3>
              </div>
              {goalForm.id && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this goal?')) {
                      deleteGoalMutation.mutate(goalForm.id);
                    }
                  }}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                  title="Delete Goal"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const payload = {
                id: goalForm.id,
                name: goalForm.name,
                target: Number(goalForm.target),
                current: Number(goalForm.current),
                targetYear: Number(goalForm.targetYear),
                category: goalForm.category
              };
              if (goalForm.id) {
                updateGoalMutation.mutate(payload);
              } else {
                createGoalMutation.mutate(payload);
              }
            }} className="space-y-3.5">
              
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g., Retirement, Child Education"
                  value={goalForm.name}
                  onChange={e => setGoalForm({ ...goalForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Target Amount (₹)</label>
                  <input
                    type="number"
                    value={goalForm.target}
                    onChange={e => setGoalForm({ ...goalForm, target: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Current Saved (₹)</label>
                  <input
                    type="number"
                    value={goalForm.current}
                    onChange={e => setGoalForm({ ...goalForm, current: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Target Year</label>
                  <input
                    type="number"
                    value={goalForm.targetYear}
                    onChange={e => setGoalForm({ ...goalForm, targetYear: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Category</label>
                  <select
                    value={goalForm.category}
                    onChange={e => setGoalForm({ ...goalForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                  >
                    <option value="Retirement">Retirement</option>
                    <option value="Safety">Emergency Buffer</option>
                    <option value="Property">Home/Real Estate</option>
                    <option value="Education">Education</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-500 rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                  className="flex-1 py-2.5 bg-[#003366] text-white text-xs font-bold rounded-full hover:bg-[#002B54] transition-all cursor-pointer shadow-md"
                >
                  {createGoalMutation.isPending || updateGoalMutation.isPending ? 'Saving...' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
