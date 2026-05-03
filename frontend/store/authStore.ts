import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,

  setAuth: (user, accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('lms_user', JSON.stringify(user));
    set({ user, accessToken });
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('lms_user');
    set({ user: null, accessToken: null });
  },

  hydrate: () => {
    const token = localStorage.getItem('accessToken');
    const userRaw = localStorage.getItem('lms_user');
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw);
        set({ user, accessToken: token });
      } catch {
        localStorage.removeItem('lms_user');
        localStorage.removeItem('accessToken');
      }
    }
  }
}));
