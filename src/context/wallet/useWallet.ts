import { useContext } from "react";
import { WalletContext } from "./WalletContext";
import type { WalletContextValue } from "../../types/wallet/wallet.types";

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet debe usarse dentro de un <WalletProvider>.");
  }
  return ctx;
}
