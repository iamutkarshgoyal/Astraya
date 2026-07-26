import type { AuthResponse } from '@/types/auth';

const AUTH_STORAGE_KEY = 'astraya.auth';

export function readStoredAuth(): AuthResponse | null {
  const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthResponse;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function writeStoredAuth(auth: AuthResponse) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
