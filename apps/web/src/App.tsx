import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from './store';
import { apiClient } from './api/client';
import { PhoneFrame, BottomTabBar } from './components/DesignSystem';
import { OnboardingLang } from './screens/OnboardingLang';
import { OnboardingRisk } from './screens/OnboardingRisk';
import { HomeScreen } from './screens/HomeScreen';
import { ArthAIScreen } from './screens/ArthAIScreen';
import { PlanScreen } from './screens/PlanScreen';
import { ActivityScreen } from './screens/ActivityScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { LandingScreen } from './screens/LandingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { AuthCallbackScreen } from './screens/AuthCallbackScreen';
import { ToastProvider } from './components/Toast';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAppStore(state => state.token);
  return token ? <>{children}</> : <Navigate to="/" />;
}

function AppContent() {
  const token = useAppStore(state => state.token);
  const setLanguage = useAppStore(state => state.setLanguage);
  const location = useLocation();

  useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await apiClient.get('/profile/settings');
      if (res.data.language_preference) {
        setLanguage(res.data.language_preference);
      }
      return res.data;
    },
    enabled: !!token
  });

  const isOnboarding = location.pathname.includes('onboarding') || location.pathname.includes('login') || location.pathname === '/';
  const isProfile = location.pathname === '/profile';
  const isSettings = location.pathname === '/settings';

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto phone-scroll bg-[#F4F6F9] text-gray-900">
        <Routes>
          <Route path="/" element={token ? <Navigate to="/home" /> : <LandingScreen />} />
          <Route path="/login" element={token ? <Navigate to="/home" /> : <LoginScreen />} />
          <Route path="/auth/callback" element={<AuthCallbackScreen />} />
          <Route path="/onboarding-lang" element={<PrivateRoute><OnboardingLang /></PrivateRoute>} />
          <Route path="/onboarding-risk" element={<PrivateRoute><OnboardingRisk /></PrivateRoute>} />
          <Route path="/home" element={<PrivateRoute><HomeScreen /></PrivateRoute>} />
          <Route path="/arthai" element={<PrivateRoute><ArthAIScreen /></PrivateRoute>} />
          <Route path="/plan" element={<PrivateRoute><PlanScreen /></PrivateRoute>} />
          <Route path="/activity" element={<PrivateRoute><ActivityScreen /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfileScreen /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsScreen /></PrivateRoute>} />
          <Route path="*" element={<Navigate to={token ? "/home" : "/"} />} />
        </Routes>
      </div>
      {token && !isOnboarding && !isProfile && !isSettings && <BottomTabBar />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <PhoneFrame>
          <AppContent />
        </PhoneFrame>
      </BrowserRouter>
    </ToastProvider>
  );
}
