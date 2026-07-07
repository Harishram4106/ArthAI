import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAppStore } from '../store';
import { useToast } from '../components/Toast';
import { ArrowLeft, Save, Settings as SettingsIcon } from 'lucide-react';
import { Card, PillButton } from '../components/DesignSystem';

export function SettingsScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    theme_preference: 'system',
    email_notifications: true,
    push_notifications: true,
    risk_review_reminders: true,
    show_planning_assumptions: true,
    advisor_contact_preference: 'in-app',
    report_export_format: 'markdown',
    language_preference: 'en',
    privacy_mode: false,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await apiClient.get('/profile/settings');
      return res.data;
    },
    staleTime: 5 * 60 * 1000
  });

  useEffect(() => {
    if (settings) {
      setForm(prev => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const setLanguage = useAppStore(state => state.setLanguage);

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const res = await apiClient.patch('/profile/settings', updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setLanguage(form.language_preference as any);
      toast('Settings saved successfully!', 'success');
    },
    onError: () => {
      toast('Failed to save settings. Please try again.', 'error');
    }
  });

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  const handleChange = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-8 h-8 border-4 border-[#003366] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="screen-enter px-4 py-4 pb-4 space-y-4">
      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-[#003366] hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <SettingsIcon size={20} className="text-[#003366]" /> Settings
        </h1>
      </div>

      <Card>
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Preferences</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Theme Preference</label>
            <select 
              value={form.theme_preference}
              onChange={e => handleChange('theme_preference', e.target.value)}
              className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none text-gray-800"
            >
              <option value="system">System Default</option>
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Report Export Format</label>
            <select 
              value={form.report_export_format}
              onChange={e => handleChange('report_export_format', e.target.value)}
              className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none text-gray-800"
            >
              <option value="markdown">Markdown (.md)</option>
              <option value="pdf">PDF (.pdf)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Advisor Contact Preference</label>
            <select 
              value={form.advisor_contact_preference}
              onChange={e => handleChange('advisor_contact_preference', e.target.value)}
              className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none text-gray-800"
            >
              <option value="in-app">In-App Chat</option>
              <option value="email">Email</option>
              <option value="phone">Phone Call</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Language Preference</label>
            <select 
              value={form.language_preference}
              onChange={e => handleChange('language_preference', e.target.value)}
              className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none text-gray-800"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Features & Notifications</h2>
        
        <div className="space-y-4">
          {[
            { key: 'email_notifications', label: 'Email Notifications' },
            { key: 'push_notifications', label: 'Push Notifications' },
            { key: 'risk_review_reminders', label: 'Risk Review Reminders' },
            { key: 'show_planning_assumptions', label: 'Show Planning Assumptions' },
            { key: 'privacy_mode', label: 'Privacy Mode (Hide Balances)' },
          ].map((toggle) => (
            <div key={toggle.key} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{toggle.label}</span>
              <button 
                onClick={() => handleChange(toggle.key, !(form as any)[toggle.key])}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${(form as any)[toggle.key] ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${(form as any)[toggle.key] ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <div className="pt-2">
        <PillButton 
          onClick={handleSave} 
          disabled={updateMutation.isPending}
          className="w-full flex items-center justify-center gap-2 text-sm"
        >
          <Save size={16} /> {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
        </PillButton>
      </div>
    </div>
  );
}
