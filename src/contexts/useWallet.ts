import { useContext } from "react";
import { WalletContext } from "./wallet-context";

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet은 WalletProvider 안에서만 사용할 수 있습니다.");
  }

  return context;
}
