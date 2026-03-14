import { create } from 'zustand';
import * as api from '../lib/api';

const STORAGE_KEYS = {
  token: 'boxbox-auth-token',
  username: 'boxbox-auth-username',
  playerCode: 'boxbox-auth-player-code',
  isGuest: 'boxbox-auth-guest',
  userId: 'boxbox-auth-user-id',
  guestId: 'boxbox-guest-id',
} as const;

interface AuthState {
  token: string | null;
  username: string | null;
  playerCode: string | null;
  userId: string | null;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  playAsGuest: () => void;
  logout: () => void;
  clearError: () => void;
  isAuthenticated: () => boolean;
}

function parseJwtSub(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

function loadFromStorage() {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  const userId = localStorage.getItem(STORAGE_KEYS.userId)
    ?? (token ? parseJwtSub(token) : null)
    ?? (localStorage.getItem(STORAGE_KEYS.isGuest) === 'true'
      ? localStorage.getItem(STORAGE_KEYS.guestId)
      : null);

  return {
    token,
    username: localStorage.getItem(STORAGE_KEYS.username),
    playerCode: localStorage.getItem(STORAGE_KEYS.playerCode),
    userId,
    isGuest: localStorage.getItem(STORAGE_KEYS.isGuest) === 'true',
  };
}

function saveToStorage(token: string, username: string, playerCode: string, userId: string) {
  localStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.setItem(STORAGE_KEYS.username, username);
  localStorage.setItem(STORAGE_KEYS.playerCode, playerCode);
  localStorage.setItem(STORAGE_KEYS.userId, userId);
  localStorage.removeItem(STORAGE_KEYS.isGuest);
}

function clearAuthStorage() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.username);
  localStorage.removeItem(STORAGE_KEYS.playerCode);
  localStorage.removeItem(STORAGE_KEYS.userId);
  localStorage.removeItem(STORAGE_KEYS.isGuest);
  // Note: guestId is NOT cleared — it persists so the same guest can return
}

const initial = loadFromStorage();

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initial.token,
  username: initial.username,
  playerCode: initial.playerCode,
  userId: initial.userId,
  isGuest: initial.isGuest,
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.login(username, password);
      const userId = parseJwtSub(res.token) ?? res.username;
      saveToStorage(res.token, res.username, res.playerCode, userId);
      set({ token: res.token, username: res.username, playerCode: res.playerCode, userId, isGuest: false, isLoading: false });
    } catch (err) {
      const message = err instanceof api.ApiError
        ? (err.status === 401 ? 'invalidCredentials' : err.message)
        : 'networkError';
      set({ isLoading: false, error: message });
    }
  },

  register: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.register(username, password);
      const userId = parseJwtSub(res.token) ?? res.username;
      saveToStorage(res.token, res.username, res.playerCode, userId);
      set({ token: res.token, username: res.username, playerCode: res.playerCode, userId, isGuest: false, isLoading: false });
    } catch (err) {
      const message = err instanceof api.ApiError
        ? (err.status === 409 ? 'usernameExists' : err.message)
        : 'networkError';
      set({ isLoading: false, error: message });
    }
  },

  playAsGuest: () => {
    // Reuse existing guest UUID if available, otherwise create one
    const guestId = localStorage.getItem(STORAGE_KEYS.guestId) ?? crypto.randomUUID();
    localStorage.setItem(STORAGE_KEYS.guestId, guestId);
    localStorage.setItem(STORAGE_KEYS.isGuest, 'true');
    localStorage.setItem(STORAGE_KEYS.userId, guestId);
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.username);
    localStorage.removeItem(STORAGE_KEYS.playerCode);
    set({ token: null, username: null, playerCode: null, userId: guestId, isGuest: true, error: null });
  },

  logout: () => {
    clearAuthStorage();
    set({ token: null, username: null, playerCode: null, userId: null, isGuest: false, error: null });
  },

  clearError: () => set({ error: null }),

  isAuthenticated: () => !!get().token,
}));
