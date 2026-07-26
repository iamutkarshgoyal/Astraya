import { api } from '@/services/api';
import type { AuthResponse, LoginPayload, SignupPayload, User } from '@/types/auth';

export const authService = {
  async signup(payload: SignupPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', payload);
    return response.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },

  async me(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async forgotPassword(email: string): Promise<{ message: string; reset_token?: string | null }> {
    const response = await api.post<{ message: string; reset_token?: string | null }>(
      '/auth/forgot-password',
      { email },
    );
    return response.data;
  },

  async resetPassword(payload: {
    email: string;
    reset_token: string;
    new_password: string;
  }): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/reset-password', payload);
    return response.data;
  },
};
