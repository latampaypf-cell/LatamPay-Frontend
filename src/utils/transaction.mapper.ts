import {
  SUPPORTED_CURRENCIES,
  type ApiTransaction,
  type Currency,
  type Transaction,
  type TransactionKind,
} from "../types/wallet/wallet.types";

export const isCurrency = (code: string): code is Currency =>
  (SUPPORTED_CURRENCIES as string[]).includes(code);

export const mapTransaction = (t: ApiTransaction): Transaction => {
  const fromAmount = Number(t.from_amount ?? 0);
  const toAmount = Number(t.to_amount ?? 0);
  let title = "";
  let amount = 0;
  let kind: TransactionKind = "other";
  let counterpartyName: string | undefined;
  let counterpartyCbu: string | undefined;

  switch (t.type) {
    case "transfer":
      title = "Transferencia";
      if (t.direction === "sent") {
        amount = -fromAmount;
        kind = "transfer_sent";
        counterpartyName = t.to_name ?? undefined;
        counterpartyCbu = t.to_cbu ?? undefined;
      } else {
        amount = toAmount;
        kind = "transfer_received";
        counterpartyName = t.from_name ?? undefined;
        counterpartyCbu = t.from_cbu ?? undefined;
      }
      break;
    case "deposit":
      title = "Depósito";
      amount = toAmount;
      kind = "deposit";
      break;
    case "withdraw":
      title = "Retiro";
      amount = -fromAmount;
      kind = "withdraw";
      break;
    case "swap":
      title = `Conversión ${t.from_currency ?? ""} → ${t.to_currency ?? ""}`.trim();
      amount = t.direction === "sent" ? -fromAmount : toAmount;
      kind = "swap";
      break;
    default:
      title = t.type;
      amount = t.direction === "sent" ? -fromAmount : toAmount;
      kind = "other";
  }

  const currencyCode =
    t.direction === "sent" ? t.from_currency : t.to_currency;
  const currency =
    currencyCode && isCurrency(currencyCode) ? currencyCode : undefined;

  const rawRate = Number(t.exchange_rate ?? NaN);
  const exchangeRate = Number.isFinite(rawRate) && rawRate > 0 ? rawRate : undefined;

  return {
    id: t.id,
    title,
    amount,
    kind,
    createdAt: t.created_at,
    status: t.status,
    description: t.description ?? undefined,
    counterpartyName,
    counterpartyCbu,
    currency,
    direction: t.direction,
    exchangeRate,
    fromCurrency: t.from_currency ?? undefined,
    toCurrency: t.to_currency ?? undefined,
    fromAmount: Number.isFinite(fromAmount) ? fromAmount : undefined,
    toAmount: Number.isFinite(toAmount) ? toAmount : undefined,
  };
};
