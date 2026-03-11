import { createContext } from "react";
import type { WalletContextValue } from "./wallet-type";

export const WalletContext = createContext<WalletContextValue | null>(null);
