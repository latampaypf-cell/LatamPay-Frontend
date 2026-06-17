import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../AuthContext";
import type { WalletContextValue } from "../../types/wallet/wallet.types";
import { WalletContext } from "./WalletContext";
import { INITIAL_STATE, type WalletState } from "./walletState";
import {
  createRefresh,
  createSwap,
  createTransfer,
} from "./walletActions";
import { createCanAfford, createGetRate } from "./walletSelectors";

type WalletProviderProps = {
  children: ReactNode;
};

export function WalletProvider({ children }: WalletProviderProps) {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<WalletState>(INITIAL_STATE);

  const refresh = useMemo(() => createRefresh(setState), []);

  useEffect(() => {
    if (isAuthenticated) {
      void refresh();
    } else {
      setState(INITIAL_STATE);
    }
  }, [isAuthenticated, refresh]);

  const transfer = useMemo(
    () => createTransfer({ balances: state.balances, refresh }),
    [refresh, state.balances],
  );

  const swap = useMemo(
    () => createSwap({ balances: state.balances, refresh }),
    [refresh, state.balances],
  );

  const canAfford = useMemo(
    () => createCanAfford(state.balances),
    [state.balances],
  );

  const getRate = useMemo(() => createGetRate(state.rates), [state.rates]);

  const value = useMemo<WalletContextValue>(
    () => ({
      balance: state.balance,
      balances: state.balances,
      transactions: state.transactions,
      rates: state.rates,
      cbu: state.cbu,
      alias: state.alias,
      isLoading: state.isLoading,
      error: state.error,
      canAfford,
      getRate,
      transfer,
      swap,
      refresh,
    }),
    [
      state.balance,
      state.balances,
      state.transactions,
      state.rates,
      state.cbu,
      state.alias,
      state.isLoading,
      state.error,
      canAfford,
      getRate,
      transfer,
      swap,
      refresh,
    ],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
