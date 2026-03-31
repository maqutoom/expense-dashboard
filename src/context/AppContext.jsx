import { createContext, useContext, useEffect, useState } from 'react';
import { defaultTransaction } from '../data/mockData';
import {
  clearSession,
  loadAppState,
  loadSession,
  loadTheme,
  saveAppState,
  saveSession,
  saveTheme,
} from '../utils/storage';

const AppContext = createContext(null);

const createId = (prefix) => `${prefix}-${crypto.randomUUID()}`;

export function AppProvider({ children }) {
  const [appState, setAppState] = useState(() => loadAppState());
  const [sessionUserId, setSessionUserId] = useState(() => loadSession());
  const [theme, setTheme] = useState(() => loadTheme());

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  useEffect(() => {
    if (sessionUserId) {
      saveSession(sessionUserId);
    } else {
      clearSession();
    }
  }, [sessionUserId]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    saveTheme(theme);
  }, [theme]);

  const currentUser = appState.users.find((user) => user.id === sessionUserId) || null;

  const updateCurrentUser = (updater) => {
    if (!currentUser) return;

    setAppState((prev) => ({
      ...prev,
      users: prev.users.map((user) =>
        user.id === currentUser.id ? updater(user) : user,
      ),
    }));
  };

  const login = ({ email, password }) => {
    const foundUser = appState.users.find(
      (user) =>
        user.email.trim().toLowerCase() === email.trim().toLowerCase() &&
        user.password === password,
    );

    if (!foundUser) {
      return { success: false, message: 'Invalid email or password.' };
    }

    setSessionUserId(foundUser.id);
    return { success: true };
  };

  const signup = ({ name, email, password }) => {
    const emailExists = appState.users.some(
      (user) => user.email.trim().toLowerCase() === email.trim().toLowerCase(),
    );

    if (emailExists) {
      return { success: false, message: 'An account with that email already exists.' };
    }

    const nextUser = {
      id: createId('user'),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      budget: 0,
      joinedAt: new Date().toISOString().split('T')[0],
      transactions: [],
    };

    setAppState((prev) => ({
      ...prev,
      users: [...prev.users, nextUser],
    }));
    setSessionUserId(nextUser.id);
    return { success: true };
  };

  const logout = () => setSessionUserId(null);

  const addTransaction = (transaction) => {
    updateCurrentUser((user) => ({
      ...user,
      transactions: [
        { ...transaction, id: createId('txn'), amount: Number(transaction.amount) },
        ...user.transactions,
      ],
    }));
  };

  const updateTransaction = (id, updatedValues) => {
    updateCurrentUser((user) => ({
      ...user,
      transactions: user.transactions.map((transaction) =>
        transaction.id === id
          ? { ...transaction, ...updatedValues, amount: Number(updatedValues.amount) }
          : transaction,
      ),
    }));
  };

  const deleteTransaction = (id) => {
    updateCurrentUser((user) => ({
      ...user,
      transactions: user.transactions.filter((transaction) => transaction.id !== id),
    }));
  };

  const setBudget = (budget) => {
    updateCurrentUser((user) => ({ ...user, budget: Number(budget) }));
  };

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const value = {
    appState,
    currentUser,
    defaultTransaction,
    theme,
    login,
    signup,
    logout,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setBudget,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
