import { seedUsers } from '../data/mockData';

const APP_KEY = 'expance-app-v1';
const SESSION_KEY = 'expance-session-v1';
const THEME_KEY = 'expance-theme-v1';

export const loadAppState = () => {
  const raw = localStorage.getItem(APP_KEY);
  if (!raw) {
    const initialState = { users: seedUsers };
    localStorage.setItem(APP_KEY, JSON.stringify(initialState));
    return initialState;
  }

  try {
    return JSON.parse(raw);
  } catch {
    const fallbackState = { users: seedUsers };
    localStorage.setItem(APP_KEY, JSON.stringify(fallbackState));
    return fallbackState;
  }
};

export const saveAppState = (state) => {
  localStorage.setItem(APP_KEY, JSON.stringify(state));
};

export const loadSession = () => localStorage.getItem(SESSION_KEY);
export const saveSession = (userId) => localStorage.setItem(SESSION_KEY, userId);
export const clearSession = () => localStorage.removeItem(SESSION_KEY);

export const loadTheme = () => localStorage.getItem(THEME_KEY) || 'dark';
export const saveTheme = (theme) => localStorage.setItem(THEME_KEY, theme);
