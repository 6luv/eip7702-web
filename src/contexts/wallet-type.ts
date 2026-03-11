export type WalletContextValue = {
  account: string | null;
  chainId: string | null;
  isConnected: boolean;
  message: string | null;
  balance: number | null;
  symbol: string | null;
  connect: () => Promise<void>;
  getBalance: (account: `0x${string}`) => Promise<void>;
  terminate: () => Promise<void>;
};
