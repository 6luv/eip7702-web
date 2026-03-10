import { useMemo, useState, type ReactNode } from "react";
import { AUTH_STORAGE_KEY, type AuthUser } from "./auth-types";
import { AuthContext } from "./auth-context";

function getInitialUser(): AuthUser | null {
  const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser) as AuthUser;
  } catch (error) {
    console.error("저장된 유저 정보를 읽지 못했습니다.", error);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getInitialUser());

  const login = (nextUser: AuthUser) => {
    setUser(nextUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      login,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
