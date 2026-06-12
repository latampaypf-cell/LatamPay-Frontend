import type {
  Currency,
  Transaction,
  TransactionKind,
} from "../types/wallet/wallet.types";

export const SUCCESS_STATUS = "completed";

export const MONTH_LABELS_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

export const KIND_LABEL_ES: Record<TransactionKind, string> = {
  transfer_sent: "Enviadas",
  transfer_received: "Recibidas",
  deposit: "Depósitos",
  withdraw: "Retiros",
  swap: "Conversiones",
  other: "Otros",
};

const SPENT_KINDS: TransactionKind[] = ["transfer_sent", "withdraw"];
const RECEIVED_KINDS: TransactionKind[] = ["transfer_received", "deposit"];

const isSpent = (kind: TransactionKind): boolean => SPENT_KINDS.includes(kind);
const isReceived = (kind: TransactionKind): boolean =>
  RECEIVED_KINDS.includes(kind);

const parseDate = (iso: string): Date | null => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Filtra transacciones por moneda y status exitoso. Excluye las que no
 * tengan currency definida.
 */
const filterByCurrencyAndStatus = (
  transactions: Transaction[],
  currency: Currency,
): Transaction[] =>
  transactions.filter(
    (t) => t.currency === currency && t.status === SUCCESS_STATUS,
  );

const matchesMonth = (date: Date, year: number, month: number): boolean =>
  date.getFullYear() === year && date.getMonth() === month;

const matchesYear = (date: Date, year: number): boolean =>
  date.getFullYear() === year;

export type MonthlySummary = {
  totalSpent: number;
  totalReceived: number;
  totalSwapped: number;
  count: number;
};

export const getMonthlySummary = (
  transactions: Transaction[],
  currency: Currency,
  year: number,
  month: number,
): MonthlySummary => {
  const filtered = filterByCurrencyAndStatus(transactions, currency);

  let totalSpent = 0;
  let totalReceived = 0;
  let totalSwapped = 0;
  let count = 0;

  for (const t of filtered) {
    const d = parseDate(t.createdAt);
    if (!d || !matchesMonth(d, year, month)) continue;

    const abs = Math.abs(t.amount);
    if (isSpent(t.kind)) totalSpent += abs;
    else if (isReceived(t.kind)) totalReceived += abs;
    else if (t.kind === "swap") totalSwapped += abs;
    count += 1;
  }

  return { totalSpent, totalReceived, totalSwapped, count };
};

export type YearlyMonth = {
  month: number;
  monthLabel: string;
  spent: number;
  received: number;
};

export const getYearlyByMonth = (
  transactions: Transaction[],
  currency: Currency,
  year: number,
): YearlyMonth[] => {
  const months: YearlyMonth[] = MONTH_LABELS_ES.map((label, idx) => ({
    month: idx,
    monthLabel: label,
    spent: 0,
    received: 0,
  }));

  const filtered = filterByCurrencyAndStatus(transactions, currency);

  for (const t of filtered) {
    const d = parseDate(t.createdAt);
    if (!d || !matchesYear(d, year)) continue;

    const bucket = months[d.getMonth()];
    if (!bucket) continue;

    const abs = Math.abs(t.amount);
    if (isSpent(t.kind)) bucket.spent += abs;
    else if (isReceived(t.kind)) bucket.received += abs;
  }

  return months;
};

export type KindDistribution = {
  kind: TransactionKind;
  label: string;
  total: number;
  count: number;
};

export const getDistributionByKind = (
  transactions: Transaction[],
  currency: Currency,
  year: number,
  month: number,
): KindDistribution[] => {
  const filtered = filterByCurrencyAndStatus(transactions, currency);

  const bucket = new Map<TransactionKind, { total: number; count: number }>();

  for (const t of filtered) {
    const d = parseDate(t.createdAt);
    if (!d || !matchesMonth(d, year, month)) continue;

    const entry = bucket.get(t.kind) ?? { total: 0, count: 0 };
    entry.total += Math.abs(t.amount);
    entry.count += 1;
    bucket.set(t.kind, entry);
  }

  return Array.from(bucket.entries())
    .map(([kind, { total, count }]) => ({
      kind,
      label: KIND_LABEL_ES[kind],
      total,
      count,
    }))
    .sort((a, b) => b.total - a.total);
};
