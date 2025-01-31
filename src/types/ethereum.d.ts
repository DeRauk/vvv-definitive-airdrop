export {};

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: {
        method: string;
        params?: Array<{
          chainId?: string;
          chainName?: string;
          nativeCurrency?: {
            name: string;
            symbol: string;
            decimals: number;
          };
          rpcUrls?: string[];
          blockExplorerUrls?: string[];
        } | string[]>;
      }) => Promise<string | void>;
    };
  }
} 