import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Coins,
  Inbox,
  PieChart as PieChartIcon,
  Repeat,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { Spinner } from "../../components/ui/Spinner";
import { useAllTransactions } from "../../hooks/useAllTransactions";
import {
  getDistributionByKind,
  getMonthlySummary,
  getYearlyByMonth,
} from "../../utils/analytics";
import {
  SUPPORTED_CURRENCIES,
  type Currency,
  type TransactionKind,
} from "../../types/wallet/wallet.types";

const MONTH_FULL_LABELS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const KIND_COLOR: Record<TransactionKind, string> = {
  transfer_sent: "#f87171", // red-400
  transfer_received: "#34d399", // emerald-400
  deposit: "#06b6d4", // cyan-500
  withdraw: "#f59e0b", // amber-500
  swap: "#8b5cf6", // violet-500
  other: "#94a3b8", // slate-400
};

const SPENT_COLOR = "#ef4444";
const RECEIVED_COLOR = "#10b981";

const formatCurrency = (value: number, currency: Currency): string =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

const getYearOptions = (currentYear: number): number[] => {
  const start = currentYear - 4;
  return Array.from({ length: 6 }, (_, i) => start + i);
};

type ChartTooltipProps = {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: readonly any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  label?: any;
};

const makeBarTooltip =
  (currency: Currency) =>
  ({ active, payload, label }: ChartTooltipProps) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div className="rounded-xl border border-white/10 bg-slate-950/95 px-3 py-2 text-xs text-slate-200 shadow-lg backdrop-blur-xl">
        <p className="mb-1 font-medium text-slate-100">{String(label ?? "")}</p>
        {payload.map((p, idx) => (
          <p
            key={idx}
            className="flex items-center justify-between gap-3"
            style={{ color: p.color }}
          >
            <span>{p.name}</span>
            <span className="font-medium">
              {formatCurrency(Number(p.value ?? 0), currency)}
            </span>
          </p>
        ))}
      </div>
    );
  };

const makePieTooltip =
  (currency: Currency) =>
  ({ active, payload }: ChartTooltipProps) => {
    if (!active || !payload || payload.length === 0) return null;
    const item = payload[0];
    const data = item?.payload as
      | { label?: string; total?: number; count?: number }
      | undefined;
    return (
      <div className="rounded-xl border border-white/10 bg-slate-950/95 px-3 py-2 text-xs text-slate-200 shadow-lg backdrop-blur-xl">
        <p className="font-medium text-slate-100">{data?.label}</p>
        <p className="mt-1" style={{ color: item?.color }}>
          {formatCurrency(Number(data?.total ?? 0), currency)}
        </p>
        <p className="mt-0.5 text-slate-400">
          {data?.count} operación{(data?.count ?? 0) === 1 ? "" : "es"}
        </p>
      </div>
    );
  };

export const Analytics = () => {
  const now = new Date();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("ARS");
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());

  const { transactions, isLoading, error, refetch } = useAllTransactions();

  const summary = useMemo(
    () =>
      getMonthlySummary(
        transactions,
        selectedCurrency,
        selectedYear,
        selectedMonth,
      ),
    [transactions, selectedCurrency, selectedYear, selectedMonth],
  );

  const yearly = useMemo(
    () => getYearlyByMonth(transactions, selectedCurrency, selectedYear),
    [transactions, selectedCurrency, selectedYear],
  );

  const distribution = useMemo(
    () =>
      getDistributionByKind(
        transactions,
        selectedCurrency,
        selectedYear,
        selectedMonth,
      ),
    [transactions, selectedCurrency, selectedYear, selectedMonth],
  );

  const yearlyHasData = useMemo(
    () => yearly.some((m) => m.spent > 0 || m.received > 0),
    [yearly],
  );

  const monthlyHasData = summary.count > 0;

  const barTooltip = useMemo(
    () => makeBarTooltip(selectedCurrency),
    [selectedCurrency],
  );
  const pieTooltip = useMemo(
    () => makePieTooltip(selectedCurrency),
    [selectedCurrency],
  );

  return (
    <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-slate-950 px-6 py-12 text-white">
      {/* Fondo animado */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-3xl"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold md:text-5xl">
            Análisis de{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
              movimientos
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Revisá lo que entró y lo que salió de tu cuenta, mes a mes.
          </p>
        </motion.div>

        {/* Selectores */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl md:grid-cols-3"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Moneda
            </span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
              className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-500/40"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900">
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Mes
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-500/40"
            >
              {MONTH_FULL_LABELS_ES.map((m, idx) => (
                <option key={m} value={idx} className="bg-slate-900">
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Año
            </span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-500/40"
            >
              {getYearOptions(now.getFullYear()).map((y) => (
                <option key={y} value={y} className="bg-slate-900">
                  {y}
                </option>
              ))}
            </select>
          </label>
        </motion.div>

        {/* Estados */}
        {isLoading && (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-16 backdrop-blur-xl">
            <Spinner size={32} />
            <p className="mt-4 text-sm text-slate-400">
              Cargando movimientos…
            </p>
          </div>
        )}

        {!isLoading && error && (
          <ErrorState
            className="mt-10"
            title="No pudimos cargar tus movimientos"
            description={error}
            onRetry={() => void refetch()}
          />
        )}

        {!isLoading && !error && (
          <>
            {/* Resumen */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-8 grid gap-4 md:grid-cols-3"
            >
              <Card padding="md" radius="lg">
                <div className="flex items-center gap-2 text-slate-400">
                  <TrendingDown size={16} className="text-red-400" />
                  <span className="text-sm">Total gastado</span>
                </div>
                <p className="mt-3 text-2xl font-bold text-red-300">
                  {formatCurrency(summary.totalSpent, selectedCurrency)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Envíos + retiros en {selectedCurrency}
                </p>
              </Card>

              <Card padding="md" radius="lg">
                <div className="flex items-center gap-2 text-slate-400">
                  <TrendingUp size={16} className="text-emerald-400" />
                  <span className="text-sm">Total recibido</span>
                </div>
                <p className="mt-3 text-2xl font-bold text-emerald-300">
                  {formatCurrency(summary.totalReceived, selectedCurrency)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Cobros + depósitos en {selectedCurrency}
                </p>
              </Card>

              <Card padding="md" radius="lg">
                <div className="flex items-center gap-2 text-slate-400">
                  <Coins size={16} className="text-cyan-400" />
                  <span className="text-sm">Operaciones del mes</span>
                </div>
                <p className="mt-3 text-2xl font-bold text-cyan-300">
                  {summary.count}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <Repeat size={12} />
                  Incluye{" "}
                  {formatCurrency(summary.totalSwapped, selectedCurrency)} en
                  conversiones
                </p>
              </Card>
            </motion.section>

            {/* BarChart anual */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10">
                  <BarChart3 size={20} className="text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold md:text-xl">
                    Evolución mensual {selectedYear}
                  </h2>
                  <p className="text-xs text-slate-400 md:text-sm">
                    Gastos y entradas en {selectedCurrency}
                  </p>
                </div>
              </div>

              {yearlyHasData ? (
                <div className="w-full min-w-0">
                  <ResponsiveContainer width="100%" height={288} minWidth={0}>
                    <BarChart
                      data={yearly}
                      margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
                    >
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="monthLabel"
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickFormatter={(v: number) =>
                          new Intl.NumberFormat("es-AR", {
                            notation: "compact",
                            maximumFractionDigits: 1,
                          }).format(v)
                        }
                      />
                      <Tooltip content={barTooltip} />
                      <Legend
                        wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }}
                      />
                      <Bar
                        dataKey="received"
                        name="Recibido"
                        fill={RECEIVED_COLOR}
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="spent"
                        name="Gastado"
                        fill={SPENT_COLOR}
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  icon={Inbox}
                  title="Sin movimientos en este año"
                  description={`No registramos transacciones en ${selectedCurrency} durante ${selectedYear}.`}
                />
              )}
            </motion.section>

            {/* PieChart de distribución */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
                  <PieChartIcon size={20} className="text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold md:text-xl">
                    Distribución por tipo
                  </h2>
                  <p className="text-xs text-slate-400 md:text-sm">
                    {MONTH_FULL_LABELS_ES[selectedMonth]} {selectedYear}
                  </p>
                </div>
              </div>

              {monthlyHasData ? (
                <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
                  <div className="w-full min-w-0">
                    <ResponsiveContainer width="100%" height={288} minWidth={0}>
                      <PieChart>
                        <Pie
                          data={distribution}
                          dataKey="total"
                          nameKey="label"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                        >
                          {distribution.map((entry) => (
                            <Cell
                              key={entry.kind}
                              fill={KIND_COLOR[entry.kind]}
                              stroke="transparent"
                            />
                          ))}
                        </Pie>
                        <Tooltip content={pieTooltip} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <ul className="space-y-3">
                    {distribution.map((item) => (
                      <li
                        key={item.kind}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className="inline-block h-3 w-3 rounded-full"
                            style={{ backgroundColor: KIND_COLOR[item.kind] }}
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-100">
                              {item.label}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.count} operación
                              {item.count === 1 ? "" : "es"}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-slate-100">
                          {formatCurrency(item.total, selectedCurrency)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <EmptyState
                  icon={Inbox}
                  title="Sin movimientos este mes"
                  description={`Probá con otro mes o moneda. Estás viendo ${MONTH_FULL_LABELS_ES[selectedMonth]} ${selectedYear} en ${selectedCurrency}.`}
                />
              )}
            </motion.section>
          </>
        )}
      </div>
    </section>
  );
};

export default Analytics;
