import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import type { Transaction } from "../../types/wallet/wallet.types";
import { TransactionHistory } from "./TransactionHistory";

type ActionFilter =
  | "all"
  | "transfer_sent"
  | "transfer_received"
  | "deposit"
  | "swap";
type DateFilter = "all" | "today" | "week" | "month";
type AmountFilter = "all" | "low" | "mid" | "high";

const PAGE_SIZE = 10;

const actionOptions: { value: ActionFilter; label: string }[] = [
  { value: "all", label: "Todas las acciones" },
  { value: "transfer_sent", label: "Transferencias enviadas" },
  { value: "transfer_received", label: "Transferencias recibidas" },
  { value: "deposit", label: "Depósitos" },
  { value: "swap", label: "Conversiones" },
];

const dateOptions: { value: DateFilter; label: string }[] = [
  { value: "all", label: "Cualquier fecha" },
  { value: "today", label: "Hoy" },
  { value: "week", label: "Últimos 7 días" },
  { value: "month", label: "Últimos 30 días" },
];

const amountOptions: { value: AmountFilter; label: string }[] = [
  { value: "all", label: "Cualquier monto" },
  { value: "low", label: "Menos de $10.000" },
  { value: "mid", label: "$10.000 - $100.000" },
  { value: "high", label: "Más de $100.000" },
];

const matchesDate = (iso: string, filter: DateFilter): boolean => {
  if (filter === "all") return true;
  const txDate = new Date(iso);
  if (Number.isNaN(txDate.getTime())) return false;
  const now = new Date();
  if (filter === "today") {
    return txDate.toDateString() === now.toDateString();
  }
  const days = filter === "week" ? 7 : 30;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return txDate >= cutoff;
};

const matchesAmount = (amount: number, filter: AmountFilter): boolean => {
  if (filter === "all") return true;
  const abs = Math.abs(amount);
  if (filter === "low") return abs < 10000;
  if (filter === "mid") return abs >= 10000 && abs <= 100000;
  return abs > 100000;
};

const matchesAction = (tx: Transaction, filter: ActionFilter): boolean => {
  if (filter === "all") return true;
  return tx.kind === filter;
};

const getPageWindow = (current: number, total: number): (number | "ellipsis")[] => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "ellipsis")[] = [1];
  const startWindow = Math.max(2, current - 1);
  const endWindow = Math.min(total - 1, current + 1);
  if (startWindow > 2) items.push("ellipsis");
  for (let i = startWindow; i <= endWindow; i++) items.push(i);
  if (endWindow < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
};

type SelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
};

const FilterSelect = ({ label, value, onChange, options }: SelectProps) => (
  <label className="flex min-w-0 flex-col gap-1.5">
    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
      {label}
    </span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full min-w-0 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/30"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-slate-900">
          {opt.label}
        </option>
      ))}
    </select>
  </label>
);

export type TransactionsExplorerProps = {
  transactions: Transaction[];
};

export const TransactionsExplorer = ({
  transactions,
}: TransactionsExplorerProps) => {
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [amountFilter, setAmountFilter] = useState<AmountFilter>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return transactions.filter(
      (tx) =>
        matchesAction(tx, actionFilter) &&
        matchesDate(tx.createdAt, dateFilter) &&
        matchesAmount(tx.amount, amountFilter),
    );
  }, [transactions, actionFilter, dateFilter, amountFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  const handleFilterChange =
    (setter: (v: string) => void) => (value: string) => {
      setter(value);
      setPage(1);
    };

  const pageWindow = getPageWindow(currentPage, totalPages);
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const prevDisabled = currentPage === 1;
  const nextDisabled = currentPage === totalPages;
  const arrowClass =
    "rounded-lg border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-300";

  return (
    <div className="min-w-0 space-y-5">
      <div className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/40 p-3 sm:p-4">
        <div className="mb-3 flex items-center gap-2 text-slate-300">
          <Filter size={16} className="text-cyan-400" />
          <span className="text-sm font-medium">Filtros</span>
        </div>
        <div className="grid min-w-0 gap-3 md:grid-cols-3">
          <FilterSelect
            label="Acción"
            value={actionFilter}
            onChange={handleFilterChange((v) =>
              setActionFilter(v as ActionFilter),
            )}
            options={actionOptions}
          />
          <FilterSelect
            label="Fecha"
            value={dateFilter}
            onChange={handleFilterChange((v) =>
              setDateFilter(v as DateFilter),
            )}
            options={dateOptions}
          />
          <FilterSelect
            label="Monto"
            value={amountFilter}
            onChange={handleFilterChange((v) =>
              setAmountFilter(v as AmountFilter),
            )}
            options={amountOptions}
          />
        </div>
      </div>

      <TransactionHistory
        transactions={paged}
        emptyTitle="Sin resultados"
        emptyDescription="Probá ajustar los filtros para ver más movimientos."
      />

      {filtered.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-xs text-slate-500">
            Mostrando {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} de{" "}
            {filtered.length}
          </p>

          {/* Mobile: prev + "página / total" + next */}
          <div className="flex w-full items-center justify-center gap-3 sm:hidden">
            <button
              type="button"
              onClick={goPrev}
              disabled={prevDisabled}
              aria-label="Página anterior"
              className={arrowClass}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm tabular-nums text-slate-300">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={nextDisabled}
              aria-label="Página siguiente"
              className={arrowClass}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Desktop: ventana con números y ellipsis */}
          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              onClick={goPrev}
              disabled={prevDisabled}
              aria-label="Página anterior"
              className={arrowClass}
            >
              <ChevronLeft size={16} />
            </button>
            {pageWindow.map((item, idx) => {
              if (item === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-sm text-slate-500"
                    aria-hidden="true"
                  >
                    …
                  </span>
                );
              }
              const isActive = item === currentPage;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  aria-current={isActive ? "page" : undefined}
                  className={`min-w-9 rounded-lg border px-3 py-1.5 text-sm transition ${
                    isActive
                      ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                      : "border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              );
            })}
            <button
              type="button"
              onClick={goNext}
              disabled={nextDisabled}
              aria-label="Página siguiente"
              className={arrowClass}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsExplorer;
