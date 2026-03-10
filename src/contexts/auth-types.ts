export type AuthUser = {
  email?: string;
  name?: string;
  picture?: string;
  sub?: string;
  credential: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
};

export const AUTH_STORAGE_KEY = "demo_user";
