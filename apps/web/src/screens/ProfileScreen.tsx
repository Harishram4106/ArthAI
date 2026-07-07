import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store';
import { apiClient } from '../api/client';
import { Card, PillButton, RiskTag, Chip, DisclosureNote, AvatarBubble } from '../components/DesignSystem';
import { t } from '../data/i18n';
import { formatINRFull } from '../utils/format';
import { ArrowLeft, Building2, Calendar, CheckCircle2, FileUp, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Language } from '../types';

export function ProfileScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const lang = useAppStore(state => state.language);
  const setLanguage = useAppStore(state => state.setLanguage);
  const user = useAppStore(state => state.user);
  const logout = useAppStore(state => state.logout);

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appType, setAppType] = useState<'Video Call' | 'Branch Visit'>('Video Call');
  const [appDate, setAppDate] = useState('2026-06-30');
  const [appTime, setAppTime] = useState('11:00 AM');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<any>({});

  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profileMe'],
    queryFn: async () => {
      const res = await apiClient.get('/profile/me');
      return res.data;
    },
    placeholderData: {
      full_name: user?.name || 'Loading...',
      email: user?.email || 'Loading...',
      phone: '-',
      date_of_birth: '-',
      city: '-',
      country: '-',
      occupation: '-',
      monthly_income_range: '-',
      investment_experience: '-',
      preferred_currency: 'INR',
    }
  });

  React.useEffect(() => {
    if (profileData) {
      setProfileForm(profileData);
    }
  }, [profileData]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      const res = await apiClient.patch('/profile/me', updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileMe'] });
      setIsEditingProfile(false);
    }
  });

  const { data: latestRisk, isLoading: isRiskLoading, isError: isRiskError } = useQuery({
    queryKey: ['latestRisk'],
    queryFn: async () => {
      const res = await apiClient.get('/risk/latest');
      return res.data;
    },
    placeholderData: {
      profile: 'Moderate' // Default fallback to prevent UI jumps
    }
  });

  const { data: appointment, isLoading: isAppointmentLoading } = useQuery({
    queryKey: ['appointment'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/appointments/latest');
        return res.data;
      } catch (e) {
        return null; // Ignore 404s for no appointments
      }
    },
    retry: false
  });

  const bookAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/appointments', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment'] });
      setShowAppointmentModal(false);
    }
  });

  const uploadStatementMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/transactions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return res.data;
    },
    onSuccess: () => {
      alert("Statement processed successfully!");
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    },
    onError: () => {
      alert("Failed to process statement.");
    }
  });

  if (isRiskError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] space-y-4">
        <p className="text-rose-500 font-bold">Failed to load profile.</p>
        <button onClick={() => window.location.reload()} className="text-[#003366] font-bold underline">Retry</button>
      </div>
    );
  }



  const handleBookAppointment = () => {
    bookAppointmentMutation.mutate({
      type: appType,
      date: appDate,
      time: appTime,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadStatementMutation.mutate(file);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="screen-enter px-4 py-4 pb-4 space-y-4">
      {/* Top Navigation */}
      <button 
        onClick={() => navigate('/home')}
        className="flex items-center gap-1 text-xs font-bold text-[#003366] hover:underline cursor-pointer"
      >
        <ArrowLeft size={16} /> {lang === 'en' ? 'Back to Dashboard' : lang === 'hi' ? 'डैशबोर्ड पर वापस' : 'டாஷ்போர்டுக்கு திரும்பு'}
      </button>

      <div className="flex flex-col items-center relative">
        <div className="absolute right-0 top-0">
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 bg-white rounded-full text-gray-500 shadow-sm border border-gray-100 hover:text-[#003366] transition-colors"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
        <AvatarBubble size="large" />
        <h1 className="text-lg font-black text-gray-900 mt-2 tracking-tight">{user.name}</h1>
        <p className="text-xs text-gray-500 font-medium">{user.email}</p>
      </div>

      {/* Account Info Card */}
      <Card>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-[#003366]" />
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Profile Details</h2>
          </div>
          <button 
            onClick={() => {
              if (isEditingProfile) {
                updateProfileMutation.mutate(profileForm);
              } else {
                setIsEditingProfile(true);
              }
            }}
            disabled={updateProfileMutation.isPending}
            className="text-xs font-bold text-[#003366]"
          >
            {isEditingProfile ? (updateProfileMutation.isPending ? 'Saving...' : 'Save') : 'Edit'}
          </button>
        </div>

        {isProfileLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-[#003366] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : isEditingProfile ? (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-500 font-semibold mb-1">Full Name</label>
              <input 
                type="text" 
                value={profileForm.full_name || ''} 
                onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                className="w-full bg-gray-50 p-2 rounded border border-gray-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-500 font-semibold mb-1">Email</label>
              <input 
                type="email" 
                value={profileForm.email || ''} 
                disabled
                className="w-full bg-gray-100 p-2 rounded border border-gray-200 text-gray-500 outline-none cursor-not-allowed"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-gray-500 font-semibold mb-1">Phone</label>
                <input 
                  type="text" 
                  value={profileForm.phone || ''} 
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full bg-gray-50 p-2 rounded border border-gray-200 outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-500 font-semibold mb-1">Date of Birth</label>
                <input 
                  type="date" 
                  value={profileForm.date_of_birth || ''} 
                  onChange={e => setProfileForm({ ...profileForm, date_of_birth: e.target.value })}
                  className="w-full bg-gray-50 p-2 rounded border border-gray-200 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-gray-500 font-semibold mb-1">City</label>
                <input 
                  type="text" 
                  value={profileForm.city || ''} 
                  onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full bg-gray-50 p-2 rounded border border-gray-200 outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-500 font-semibold mb-1">Country</label>
                <input 
                  type="text" 
                  value={profileForm.country || ''} 
                  onChange={e => setProfileForm({ ...profileForm, country: e.target.value })}
                  className="w-full bg-gray-50 p-2 rounded border border-gray-200 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-500 font-semibold mb-1">Occupation</label>
              <input 
                type="text" 
                value={profileForm.occupation || ''} 
                onChange={e => setProfileForm({ ...profileForm, occupation: e.target.value })}
                className="w-full bg-gray-50 p-2 rounded border border-gray-200 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-gray-500 font-semibold mb-1">Monthly Income</label>
                <select 
                  value={profileForm.monthly_income_range || ''} 
                  onChange={e => setProfileForm({ ...profileForm, monthly_income_range: e.target.value })}
                  className="w-full bg-gray-50 p-2 rounded border border-gray-200 outline-none"
                >
                  <option value="">Select Range</option>
                  <option value="Under ₹50k">Under ₹50k</option>
                  <option value="₹50k - ₹1L">₹50k - ₹1L</option>
                  <option value="₹1L - ₹2L">₹1L - ₹2L</option>
                  <option value="Above ₹2L">Above ₹2L</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-gray-500 font-semibold mb-1">Investment Exp.</label>
                <select 
                  value={profileForm.investment_experience || ''} 
                  onChange={e => setProfileForm({ ...profileForm, investment_experience: e.target.value })}
                  className="w-full bg-gray-50 p-2 rounded border border-gray-200 outline-none"
                >
                  <option value="">Select Exp</option>
                  <option value="Novice">Novice</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-500 font-semibold mb-1">Preferred Currency</label>
              <select 
                value={profileForm.preferred_currency || 'INR'} 
                onChange={e => setProfileForm({ ...profileForm, preferred_currency: e.target.value })}
                className="w-full bg-gray-50 p-2 rounded border border-gray-200 outline-none"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            {[
              ['Full Name', profileData?.full_name || '-'],
              ['Email', profileData?.email || '-'],
              ['Phone', profileData?.phone || '-'],
              ['Date of Birth', profileData?.date_of_birth || '-'],
              ['City', profileData?.city || '-'],
              ['Country', profileData?.country || '-'],
              ['Occupation', profileData?.occupation || '-'],
              ['Income Range', profileData?.monthly_income_range || '-'],
              ['Experience', profileData?.investment_experience || '-'],
              ['Currency', profileData?.preferred_currency || '-'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-900 font-semibold">{value}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      {/* Upload Statement Card */}
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <FileUp size={16} className="text-emerald-600" />
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Upload Bank Statement (CSV)</h2>
        </div>
        <p className="text-xs text-gray-600 mb-3">Upload your IDBI Bank CSV statement to update your financial summary.</p>
        
        <label className={`w-full py-2.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-xs flex items-center justify-center gap-2 border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors ${uploadStatementMutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}>
           {uploadStatementMutation.isPending ? 'Processing...' : 'Select CSV File'}
           <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
        </label>
      </Card>

      {/* Human Advisor Appointment Status */}
      {isAppointmentLoading ? (
        <Card className="border-2 border-gray-100 bg-gray-50/50">
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </Card>
      ) : appointment ? (
        <Card className="border-2 border-emerald-500/30 bg-emerald-50/50">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Advisor Consultation Confirmed</h3>
              </div>
              <p className="text-xs font-bold text-gray-900 mt-1">{appointment.advisorName}</p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {appointment.type} · {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
              </p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
              {appointment.status}
            </span>
          </div>
        </Card>
      ) : (
        <Card className="border-2 border-[#003366]/20 bg-blue-50/40">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-[#003366] uppercase tracking-wider">Human Advisor Integration</h3>
            <span className="text-[10px] font-bold bg-blue-100 text-[#003366] px-2 py-0.5 rounded-full">SEBI Mandate</span>
          </div>
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            Prefer speaking directly with an IDBI Certified Wealth Manager? Schedule a priority video call or branch consultation.
          </p>
          <PillButton className="w-full text-xs font-bold" onClick={() => setShowAppointmentModal(true)}>
            {t('btn.connectHuman', lang)}
          </PillButton>
        </Card>
      )}

      {/* Export Report Card */}
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <FileUp size={16} className="text-[#003366]" />
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Advisory Summary Report</h2>
        </div>
        <p className="text-xs text-gray-600 mb-3">Download a comprehensive Markdown report of your financial health, goals, and risk profile.</p>
        <button 
          onClick={async () => {
            try {
              const res = await apiClient.get('/reports/summary', { responseType: 'blob' });
              const url = window.URL.createObjectURL(new Blob([res.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'ArthAI_Summary.md');
              document.body.appendChild(link);
              link.click();
              link.remove();
            } catch (e) {
              alert('Failed to generate report.');
            }
          }}
          className="w-full py-2.5 bg-blue-50 text-[#003366] rounded-full font-bold text-xs flex items-center justify-center gap-2 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
        >
          Download Report
        </button>
      </Card>

      {/* Risk Profile Card */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Assessed Risk Profile
          </h2>
          {isRiskLoading ? (
            <div className="w-4 h-4 border-2 border-[#003366] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <RiskTag profile={latestRisk?.profile || 'Moderate'} />
          )}
        </div>
        <PillButton variant="outline" className="w-full text-xs font-bold" onClick={() => {
          navigate('/onboarding/risk');
        }}>
          {t('btn.retakeRisk', lang)}
        </PillButton>
      </Card>

      {/* Language Switcher moved to Settings */}
      
      {/* Logout */}
      <button 
        onClick={handleLogout}
        className="w-full py-3 bg-red-50 text-red-600 rounded-full font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-red-100 transition-colors"
      >
        <LogOut size={16} /> Logout
      </button>

      {/* AI Advisory Disclosure */}
      <Card>
        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">Regulatory AI Disclosure</h2>
        <p className="text-xs text-gray-600 leading-relaxed">{t('profile.aiDisclosure', lang)}</p>
      </Card>

      <DisclosureNote text={t('general.disclosure', lang)} />

      {/* Appointment Booking Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setShowAppointmentModal(false)}>
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 border border-gray-100" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-[#003366]">
              <Calendar size={20} className="text-[#FF6B00]" />
              <h3 className="text-sm font-bold text-gray-900">Schedule Wealth Advisor</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-500 font-semibold mb-1">Consultation Mode</label>
                <div className="flex gap-2">
                  {(['Video Call', 'Branch Visit'] as const).map(mode => (
                    <button 
                      key={mode}
                      onClick={() => setAppType(mode)}
                      className={`flex-1 py-2 rounded-xl font-bold border cursor-pointer ${appType === mode ? 'bg-[#003366] text-white border-[#003366]' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Preferred Date</label>
                <input 
                  type="date" 
                  value={appDate} 
                  onChange={e => setAppDate(e.target.value)}
                  className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-200 font-semibold text-gray-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Time Slot</label>
                <select 
                  value={appTime} 
                  onChange={e => setAppTime(e.target.value)}
                  className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-200 font-semibold text-gray-800 outline-none"
                >
                  <option value="10:00 AM">10:00 AM - 10:30 AM</option>
                  <option value="11:00 AM">11:00 AM - 11:30 AM</option>
                  <option value="02:30 PM">02:30 PM - 03:00 PM</option>
                  <option value="04:00 PM">04:00 PM - 04:30 PM</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setShowAppointmentModal(false)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-500 rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <PillButton 
                onClick={handleBookAppointment}
                className="flex-1 text-xs font-bold"
                disabled={bookAppointmentMutation.isPending}
              >
                {bookAppointmentMutation.isPending ? 'Booking...' : 'Confirm Booking'}
              </PillButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
