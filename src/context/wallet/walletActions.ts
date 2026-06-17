import type { Dispatch, SetStateAction } from "react";
import {
  apiGetHistory,
  apiGetRates,
  apiGetWallet,
  apiSwap,
  apiTransfer,
} from "../../services/wallet.api";
import {
  SUPPORTED_CURRENCIES,
  type CurrencyBalances,
  type ExchangeRateKey,
  type ExchangeRatesMap,
  type WalletContextValue,
} from "../../types/wallet/wallet.types";
import { isCurrency, mapTransaction } from "../../utils/transaction.mapper";
import {
  DEFAULT_CURRENCY,
  EMPTY_BALANCES,
  type WalletState,
} from "./walletState";

type Setter = Dispatch<SetStateAction<WalletState>>;

export const createRefresh = (setState: Setter) => async (): Promise<void> => {
  setState((s) => ({ ...s, isLoading: true, error: null }));
  try {
    const [wallet, history, ratesResponse] = await Promise.all([
      apiGetWallet(),
      apiGetHistory(1, 50),
      apiGetRates().catch(
        () => [] as Awaited<ReturnType<typeof apiGetRates>>,
      ),
    ]);

    const balances: CurrencyBalances = { ...EMPTY_BALANCES };
    if (wallet && Array.isArray(wallet.balances)) {
      for (const b of wallet.balances) {
        if (isCurrency(b.currency_code)) {
          const n = Number(b.amount);
          balances[b.currency_code] = Number.isFinite(n) ? n : 0;
        }
      }
    }

    const transactions = history.transactions.map(mapTransaction);

    const rates: ExchangeRatesMap = {};
    for (const r of ratesResponse) {
      if (isCurrency(r.from_currency) && isCurrency(r.to_currency)) {
        const n = Number(r.rate);
        if (Number.isFinite(n)) {
          const key: ExchangeRateKey = `${r.from_currency}-${r.to_currency}`;
          rates[key] = n;
        }
      }
    }

    setState({
      balance: balances[DEFAULT_CURRENCY],
      balances,
      transactions,
      rates,
      cbu: wallet?.cbu ?? null,
      alias: wallet?.alias ?? null,
      isLoading: false,
      error: null,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Error al cargar la billetera.";
    setState((s) => ({ ...s, isLoading: false, error: message }));
  }
};

type ActionDeps = {
  balances: CurrencyBalances;
  refresh: () => Promise<void>;
};

export const createTransfer =
  ({ balances, refresh }: ActionDeps): WalletContextValue["transfer"] =>
  async (input) => {
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      return { ok: false, error: "Ingresá un monto válido." };
    }
    if (!(SUPPORTED_CURRENCIES as string[]).includes(input.currency)) {
      return { ok: false, error: "Moneda no soportada." };
    }
    const available = balances[input.currency] ?? 0;
    if (input.amount > available) {
      return {
        ok: false,
        error: `Saldo insuficiente en ${input.currency}.`,
      };
    }
    try {
      await apiTransfer({
        to_identifier: input.destination.trim(),
        amount: input.amount,
        currency_code: input.currency,
        description: input.description?.trim() || undefined,
      });
      await refresh();
      return { ok: true };
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "No pudimos completar la transferencia.";
      return { ok: false, error: message };
    }
  };

export const createSwap =
  ({ balances, refresh }: ActionDeps): WalletContextValue["swap"] =>
  async (input) => {
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      return { ok: false, error: "Ingresá un monto válido." };
    }
    if (input.from === input.to) {
      return { ok: false, error: "Elegí monedas distintas para convertir." };
    }
    if (
      !(SUPPORTED_CURRENCIES as string[]).includes(input.from) ||
      !(SUPPORTED_CURRENCIES as string[]).includes(input.to)
    ) {
      return { ok: false, error: "Moneda no soportada." };
    }
    const available = balances[input.from] ?? 0;
    if (input.amount > available) {
      return {
        ok: false,
        error: `Saldo insuficiente en ${input.from}.`,
      };
    }
    try {
      const result = await apiSwap({
        from_currency: input.from,
        to_currency: input.to,
        amount: input.amount,
      });
      await refresh();
      return {
        ok: true,
        toAmount: Number(result.to_amount),
        rate: Number(result.exchange_rate),
      };
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "No pudimos completar la conversión.";
      return { ok: false, error: message };
    }
  };
