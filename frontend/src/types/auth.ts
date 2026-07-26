export type User = {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
};

export type AuthResponse = AuthTokens & {
  user: User;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
};
