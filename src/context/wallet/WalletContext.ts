import { createContext } from "react";
import type { WalletContextValue } from "../../types/wallet/wallet.types";

export const WalletContext = createContext<WalletContextValue | null>(null);
