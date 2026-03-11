import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useWallet } from "../../contexts/useWallet";

export default function RequireWallet({ children }: { children: ReactNode }) {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
