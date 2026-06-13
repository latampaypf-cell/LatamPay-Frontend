import { useMemo, useState } from "react";
import { ArrowLeftRight, Coins, TrendingUp } from "lucide-react";
import {
  currencies,
  formatAmount,
  getCurrency,
  type CurrencyCode,
} from "../../services/exchangeCurrency";
import { useLiveRates } from "../../hooks/useLiveRates";

export const CurrencyConverter = () => {
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
    <article className="rounded-3xl border border-cyan-500/20 bg-white/5 p-5 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.12)] md:p-8">
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
    </article>
  );
};

export default CurrencyConverter;
