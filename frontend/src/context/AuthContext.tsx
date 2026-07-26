import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';

import { authService } from '@/services/auth-service';
import {
  clearStoredAuth,
  readStoredAuth,
  writeStoredAuth,
} from '@/services/token-storage';
import type { AuthResponse, LoginPayload, SignupPayload, User } from '@/types/auth';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [auth, setAuth] = useState<AuthResponse | null>(() => readStoredAuth());

  async function login(payload: LoginPayload) {
    const nextAuth = await authService.login(payload);
    writeStoredAuth(nextAuth);
    setAuth(nextAuth);
  }

  async function signup(payload: SignupPayload) {
    const nextAuth = await authService.signup(payload);
    writeStoredAuth(nextAuth);
    setAuth(nextAuth);
  }

  function logout() {
    clearStoredAuth();
    setAuth(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user: auth?.user ?? null,
      isAuthenticated: Boolean(auth?.access_token),
      login,
      signup,
      logout,
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used inside AuthProvider');
  }
  return context;
}
