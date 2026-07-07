import { create } from 'zustand';

import type { User, AppState, Language } from './types';

export const useAppStore = create<AppState>((set) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  language: 'en',
  
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },

  setLanguage: (language) => set({ language })
}));
