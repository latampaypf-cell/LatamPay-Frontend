import {
  SUPPORTED_CURRENCIES,
  type Currency,
  type CurrencyBalances,
  type ExchangeRatesMap,
  type Transaction,
} from "../../types/wallet/wallet.types";

export const DEFAULT_CURRENCY: Currency = "ARS";

export const EMPTY_BALANCES: CurrencyBalances = SUPPORTED_CURRENCIES.reduce(
  (acc, code) => {
    acc[code] = 0;
    return acc;
  },
  {} as CurrencyBalances,
);

export type WalletState = {
  balance: number;
  balances: CurrencyBalances;
  transactions: Transaction[];
  rates: ExchangeRatesMap;
  cbu: string | null;
  alias: string | null;
  isLoading: boolean;
  error: string | null;
};

export const INITIAL_STATE: WalletState = {
  balance: 0,
  balances: { ...EMPTY_BALANCES },
  transactions: [],
  rates: {},
  cbu: null,
  alias: null,
  isLoading: false,
  error: null,
};
