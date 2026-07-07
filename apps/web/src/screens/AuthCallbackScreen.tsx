import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * This screen handles the redirect back from Google OAuth.
 * Supabase redirects the browser here after the user consents.
 * It reads the session from the URL fragment, saves it, and
 * navigates the user into the app.
 */
export function AuthCallbackScreen() {
  const navigate = useNavigate();
  const setAuth = useAppStore(state => state.setAuth);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase exchanges the code from the URL for a session automatically.
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      const session = data.session;
      if (!session) {
        // Wait a beat and try again (handles timing on first load)
        await new Promise(r => setTimeout(r, 500));
        const { data: retryData } = await supabase.auth.getSession();
        if (!retryData.session) {
          setError('Could not retrieve session. Please try signing in again.');
          return;
        }
        saveSession(retryData.session);
      } else {
        saveSession(session);
      }
    };

    const saveSession = (session: any) => {
      // Save the access_token (used as Bearer token for API calls)
      // and the user object into the app store.
      setAuth(session.access_token, {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.full_name || session.user.email || 'User',
        profile: null,
      });
      navigate('/onboarding-lang', { replace: true });
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
          <AlertCircle size={24} className="text-rose-500" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Sign-in failed</h2>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="text-[#003366] font-semibold text-sm underline"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full gap-4 text-center">
      <Loader2 size={32} className="animate-spin text-[#003366]" />
      <p className="text-sm font-medium text-gray-500">Completing sign-in…</p>
    </div>
  );
}
