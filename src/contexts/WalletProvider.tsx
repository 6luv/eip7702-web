import { useEffect, useMemo, useState, type ReactNode } from "react";
import { type SDKProvider } from "@metamask/sdk";
import { WalletContext } from "./wallet-context";
import { MMSDK } from "../lib/metamask";
import { publicClient } from "../lib/viem";
import { erc20Abi, formatUnits } from "viem";

const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";
const TOKEN_ADDRESS = "0x3856ddCcBb3f324ea043DFc2E6Bf8f21673adDfB";

export default function WalletProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<SDKProvider | undefined>();
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);

  useEffect(() => {
    if (!MMSDK) return;
    setProvider(MMSDK.getProvider());
  }, []);

  useEffect(() => {
    if (!account) return;
    if (chainId?.toLowerCase() !== SEPOLIA_CHAIN_ID_HEX) return;

    getBalance(account as `0x${string}`);
  }, [account, chainId]);

  const connect = async (): Promise<void> => {
    try {
      const accounts = await MMSDK.connect();
      const currentProvider = MMSDK.getProvider();

      setProvider(currentProvider);

      const nextAccount = accounts[0] ?? null;
      setAccount(nextAccount);

      if (!currentProvider || !nextAccount) {
        setMessage("지갑 연결 실패");
        return;
      }

      const currentChainId = (await currentProvider.request({
        method: "eth_chainId",
      })) as string;

      setChainId(currentChainId);

      if (currentChainId.toLowerCase() !== SEPOLIA_CHAIN_ID_HEX) {
        setMessage("Sepolia 네트워크로 전환해 주세요.");
      } else {
        setMessage("지갑 연결 완료");
      }

      await getBalance(nextAccount as `0x${string}`);
    } catch (error) {
      console.error(error);
      setMessage("지갑 연결 실패");
    }
  };

  const getBalance = async (targetAccount: `0x${string}`): Promise<void> => {
    const [rawBalance, decimals, tokenSymbol] = await Promise.all([
      publicClient.readContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [targetAccount],
      }),
      publicClient.readContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals",
      }),
      publicClient.readContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: "symbol",
      }),
    ]);

    const formatted = Number(formatUnits(rawBalance, decimals));
    setBalance(formatted);
    setSymbol(tokenSymbol);
  };

  const terminate = async (): Promise<void> => {
    try {
      await MMSDK.terminate();
    } catch (error) {
      console.error(error);
    } finally {
      setProvider(undefined);
      setAccount(null);
      setChainId(null);
      setBalance(null);
      setSymbol(null);
      setMessage("지갑 연결이 해제되었습니다.");
    }
  };

  useEffect(() => {
    if (!provider?.on) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const nextAccounts = accounts as string[];
      const nextAccount = nextAccounts[0] ?? null;

      setAccount(nextAccount);

      if (!nextAccount) {
        setChainId(null);
        setBalance(null);
        setMessage("지갑 연결이 해제되었습니다.");
      }
    };

    const handleChainChanged = (nextChainId: unknown) => {
      const id = String(nextChainId);
      setChainId(id);

      if (!account) return;

      if (id.toLowerCase() !== SEPOLIA_CHAIN_ID_HEX) {
        setMessage("Sepolia 네트워크로 전환해 주세요.");
      } else {
        setMessage("지갑 연결 완료");
      }
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [provider, account]);

  const value = useMemo(
    () => ({
      account,
      chainId,
      isConnected: !!account,
      message,
      balance,
      symbol,
      connect,
      getBalance,
      terminate,
    }),
    [account, chainId, message, balance, symbol],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
