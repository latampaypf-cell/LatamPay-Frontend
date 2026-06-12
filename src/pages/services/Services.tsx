import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, Coins, TrendingUp } from "lucide-react";
import {
  currencies,
  formatAmount,
  getCurrency,
  type CurrencyCode,
} from "../../services/exchangeCurrency";
import { useLiveRates } from "../../hooks/useLiveRates";
import { LiveRatesGrid } from "../../components/exchange/LiveRatesGrid";
import type { Currency } from "../../types/wallet/wallet.types";

const QUOTE_PAIRS: { from: Currency; to: Currency; symbol: string }[] = [
  { from: "ARS", to: "COP", symbol: "$" },
  { from: "ARS", to: "VES", symbol: "Bs. " },
  { from: "COP", to: "VES", symbol: "Bs. " },
  { from: "COP", to: "ARS", symbol: "$" },
  { from: "VES", to: "ARS", symbol: "$" },
  { from: "VES", to: "COP", symbol: "$" },
];

export const Services = () => {
  const [amount, setAmount] = useState<string>("1000");
  const [from, setFrom] = useState<CurrencyCode>("ARS");
  const [to, setTo] = useState<CurrencyCode>("COP");

  const { rates, lastUpdated, isLoading, error } = useLiveRates();

  const numericAmount = Number(amount.replace(",", "."));

  const rate = useMemo<number | null>(() => {
    if (from === to) return 1;
    return rates[from]?.[to] ?? null;
  }, [rates, from, to]);

  const converted = useMemo<number | null>(() => {
    if (rate === null || Number.isNaN(numericAmount)) return null;
    return numericAmount * rate;
  }, [numericAmount, rate]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const fromCurrency = getCurrency(from);
  const toCurrency = getCurrency(to);

  const lastUpdatedLabel = lastUpdated
    ? `Actualizado ${new Date(lastUpdated).toLocaleTimeString("es-AR")}`
    : isLoading
      ? "Cargando cotizaciones…"
      : "Sin datos";

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
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl"
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
            Nuestros{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
              Servicios
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Convertí entre pesos argentinos, pesos colombianos y bolívares
            venezolanos con cotizaciones actualizadas desde nuestra base de
            datos.
          </p>
        </motion.div>

        {/* Convertidor */}
        <motion.article
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-10 rounded-3xl border border-cyan-500/20 bg-white/5 p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.12)]"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10">
              <ArrowLeftRight size={26} className="text-cyan-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">Conversor de divisas</h2>
              <p className="text-sm text-slate-400">{lastUpdatedLabel}</p>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-end">
            {/* Desde */}
            <div>
              <label className="text-sm text-slate-400">Desde</label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value as CurrencyCode)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none transition focus:border-cyan-500/40"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900">
                    {c.flag} {c.label} ({c.code})
                  </option>
                ))}
              </select>

              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-4 text-2xl font-semibold text-white outline-none transition focus:border-cyan-500/40"
              />
            </div>

            {/* Swap */}
            <div className="flex items-center justify-center pb-2">
              <button
                type="button"
                onClick={swap}
                aria-label="Invertir monedas"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 transition hover:rotate-180 hover:bg-cyan-500/20"
              >
                <ArrowLeftRight size={20} />
              </button>
            </div>

            {/* Hacia */}
            <div>
              <label className="text-sm text-slate-400">Hacia</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value as CurrencyCode)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none transition focus:border-cyan-500/40"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900">
                    {c.flag} {c.label} ({c.code})
                  </option>
                ))}
              </select>

              <div className="mt-4 w-full rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-4 text-2xl font-semibold text-cyan-300">
                {converted === null
                  ? isLoading
                    ? "Cargando…"
                    : "—"
                  : `${toCurrency.symbol} ${formatAmount(converted)}`}
              </div>
            </div>
          </div>

          {/* Tasa y resumen */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 text-slate-400">
                <TrendingUp size={16} />
                <span className="text-sm">Tipo de cambio</span>
              </div>
              <p className="mt-2 text-lg font-semibold">
                1 {fromCurrency.code} ={" "}
                <span className="text-cyan-400">
                  {rate === null ? "—" : formatAmount(rate)} {toCurrency.code}
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 text-slate-400">
                <Coins size={16} />
                <span className="text-sm">Conversión</span>
              </div>
              <p className="mt-2 text-lg font-semibold">
                {formatAmount(numericAmount || 0)} {fromCurrency.code} →{" "}
                <span className="text-cyan-400">
                  {converted === null ? "—" : formatAmount(converted)}{" "}
                  {toCurrency.code}
                </span>
              </p>
            </div>
          </div>
        </motion.article>

        {/* Tabla de cotizaciones */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10"
        >
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-xl font-semibold">Cotizaciones del día</h2>
            <span className="text-xs text-slate-500">
              Fuente: base de datos LatamPay
            </span>
          </div>

          <LiveRatesGrid
            pairs={QUOTE_PAIRS}
            variant="detailed"
            showFooter
          />
        </motion.section>
      </div>
    </section>
  );
};

export default Services;
