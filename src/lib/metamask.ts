import { MetaMaskSDK } from "@metamask/sdk";

export const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: "7702 Pay Demo",
    url: window.location.href,
    iconUrl: "https://docs.metamask.io/img/metamask-logo.svg",
  },
  infuraAPIKey: import.meta.env.VITE_INFURA_API_KEY || "",
});
