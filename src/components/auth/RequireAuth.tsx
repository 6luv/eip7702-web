import { Navigate } from "react-router-dom";
import useAuth from "../../contexts/useAuth";
import type { ReactNode } from "react";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
