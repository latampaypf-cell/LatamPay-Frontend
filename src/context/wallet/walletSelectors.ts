import type {
  Currency,
  CurrencyBalances,
  ExchangeRateKey,
  ExchangeRatesMap,
  WalletContextValue,
} from "../../types/wallet/wallet.types";

export const createCanAfford =
  (balances: CurrencyBalances): WalletContextValue["canAfford"] =>
  (amount, currency) => {
    const available = balances[currency] ?? 0;
    return Number.isFinite(amount) && amount > 0 && amount <= available;
  };

export const createGetRate =
  (rates: ExchangeRatesMap): WalletContextValue["getRate"] =>
  (from: Currency, to: Currency) => {
    if (from === to) return 1;
    const direct = rates[`${from}-${to}` as ExchangeRateKey];
    if (typeof direct === "number" && Number.isFinite(direct)) return direct;
    const inverse = rates[`${to}-${from}` as ExchangeRateKey];
    if (typeof inverse === "number" && inverse > 0) return 1 / inverse;
    return null;
  };
