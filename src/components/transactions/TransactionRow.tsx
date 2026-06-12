import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Card } from "../ui/Card";
import { formatAmount } from "../../services/transfer/format";
import type {
  Transaction,
  TransactionKind,
} from "../../types/wallet/wallet.types";

export type TransactionRowProps = {
  transaction: Transaction;
  date?: string;
  currencySymbol?: string;
};

const TYPE_LABEL: Record<TransactionKind, string> = {
  transfer_sent: "Enviada",
  transfer_received: "Recibida",
  deposit: "Depósito",
  withdraw: "Retiro",
  swap: "Conversión",
  other: "Otro",
};

const STATUS_META: Record<
  string,
  { label: string; badgeClass: string }
> = {
  completed: {
    label: "Exitosa",
    badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  success: {
    label: "Exitosa",
    badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  pending: {
    label: "Pendiente",
    badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  cancelled: {
    label: "Cancelada",
    badgeClass: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  },
  canceled: {
    label: "Cancelada",
    badgeClass: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  },
  failed: {
    label: "Fallida",
    badgeClass: "bg-red-500/10 text-red-300 border-red-500/30",
  },
  reversed: {
    label: "Revertida",
    badgeClass: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  },
};

const fullDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const formatFullDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return fullDateFormatter.format(d);
};

const DetailRow = ({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div className="flex justify-between gap-3 py-1.5 text-sm">
    <span className="shrink-0 text-slate-400">{label}</span>
    <span
      className={`text-right text-slate-100 ${mono ? "break-all font-mono" : "break-words"}`}
    >
      {value}
    </span>
  </div>
);

export const TransactionRow = ({
  transaction,
  date,
  currencySymbol = "$",
}: TransactionRowProps) => {
  const [open, setOpen] = useState(false);
  const {
    title,
    amount,
    kind,
    status,
    description,
    counterpartyName,
    counterpartyCbu,
    createdAt,
  } = transaction;

  const isCredit = amount >= 0;
  const sign = isCredit ? "+" : "-";
  const colorClass = isCredit ? "text-emerald-400" : "text-red-400";
  const formatted = formatAmount(Math.abs(amount).toString());

  const statusMeta = STATUS_META[status] ?? {
    label: status || "—",
    badgeClass: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-5">
        <div className="min-w-0">
          <p className="truncate">
            <span>{title}</span>
            {counterpartyName && (
              <>
                <span className="mx-2 text-slate-500">·</span>
                <span className="font-medium text-slate-200">
                  {counterpartyName}
                </span>
              </>
            )}
          </p>
          {date && <p className="mt-0.5 text-xs text-slate-500">{date}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className={`font-semibold ${colorClass}`}>
            {sign}
            {currencySymbol}
            {formatted}
          </span>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Ocultar detalle" : "Ver detalle"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-300"
          >
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex"
            >
              <ChevronDown size={16} />
            </motion.span>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/10 bg-slate-950/40"
          >
            <div className="space-y-1 px-5 py-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-300">
                  {TYPE_LABEL[kind]}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusMeta.badgeClass}`}
                >
                  {statusMeta.label}
                </span>
              </div>

              <DetailRow label="Operación" value={title} />
              <DetailRow label="Tipo" value={TYPE_LABEL[kind]} />
              <DetailRow label="Estado" value={statusMeta.label} />
              <DetailRow label="Fecha" value={formatFullDate(createdAt)} />
              <DetailRow label="Origen" value={counterpartyName ?? "—"} />
              <DetailRow
                label="CBU"
                value={counterpartyCbu ?? "—"}
                mono={!!counterpartyCbu}
              />
              <DetailRow label="Descripción" value={description?.trim() || "—"} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default TransactionRow;
