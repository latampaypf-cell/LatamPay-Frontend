import { useEffect, useState } from "react";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, BarChart3, TrendingUp, Users } from "lucide-react";
import { useLiveRates } from "../../../hooks/useLiveRates";
import { formatNumber } from "../utils/format";
import { useExchangeHistory } from "../../../hooks/useExchangehistory";
import type { MarketRow } from "../../../types/marketRows.types";
const EXCHANGE_PAIRS = [
  { from: "ARS", to: "COP" },
  { from: "COP", to: "ARS" },
  { from: "ARS", to: "VES" },
  { from: "VES", to: "ARS" },
  { from: "VES", to: "COP" },
  { from: "COP", to: "VES" },
];
const KPIS = [
  {
    icon: TrendingUp,
    title: "Volumen Operado",
    value: "$2.4M ARS",
    growth: "+18.2%",
  },
  { icon: Users, title: "Usuarios Activos", value: "52.1K", growth: "+3.200" },
  { icon: BarChart3, title: "Conversiones", value: "98.7%", growth: "+4.1%" },
  { icon: Activity, title: "Transacciones", value: "1.2M", growth: "+12.8%" },
];

export const HomeAnalytics = () => {
  const [pair, setPair] = useState(EXCHANGE_PAIRS[0]);
  const { rates, lastUpdated, isLoading } = useLiveRates();
  const { history: exchangeHistory, loading } = useExchangeHistory(
    pair.from,
    pair.to,
  );

  const arsCop = rates.ARS?.COP ?? null;
  const arsVes = rates.ARS?.VES ?? null;
  const distribution = useMemo(() => {
    const values = [
      {
        currency: "ARS",
        value: 1,
        color: "bg-cyan-400",
      },
      {
        currency: "COP",
        value: arsCop ?? 0,
        color: "bg-emerald-400",
      },
      {
        currency: "VES",
        value: arsVes ?? 0,
        color: "bg-yellow-400",
      },
    ];
    const total = values.reduce((acc, item) => acc + item.value, 0);

    return values.map((item) => ({
      ...item,
      percent: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0",
    }));
  }, [arsCop, arsVes]);

  const chartData = useMemo(() => {
    if (!exchangeHistory.length) {
      return [];
    }

    const grouped = new Map<string, number>();

    exchangeHistory.forEach((item) => {
      const day = item.created_at.split("T")[0];

      grouped.set(day, Number(item.rate));
    });

    const days = [...grouped.entries()]
      .map(([date, rate]) => ({
        date,
        rate,
      }))
      .slice(-10);

    const values = days.map((d) => d.rate);

    const min = Math.min(...values);
    const max = Math.max(...values);

    const span = max - min || 1;

    return days.map((day) => ({
      ...day,
      height: 30 + ((day.rate - min) / span) * 70,
    }));
  }, [exchangeHistory]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const visibleChartData = useMemo(() => {
    if (screenWidth < 640) {
      return chartData.slice(-5);
    }

    if (screenWidth < 1024) {
      return chartData.slice(-7);
    }

    return chartData.slice(-10);
  }, [chartData, screenWidth]);

  const lastUpdatedLabel = lastUpdated
    ? `Actualizado ${new Date(lastUpdated).toLocaleTimeString("es-AR")}`
    : isLoading
      ? "Cargando cotizaciones…"
      : "Sin datos";

  const marketData = useMemo(() => {
    const rows:MarketRow[] = [];

    Object.entries(rates).forEach(([from, targets]) => {
      Object.entries(targets ?? {}).forEach(([to, value]) => {
        rows.push({
          from,
          to,
          price: value,
        });
      });
    });

    return rows;
  }, [rates]);

  return (
    <div className="w-full overflow-x-hidden">
      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-400">
            Analíticas Inteligentes
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl md:text-5xl">
            Datos en tiempo real
          </h2>
          <p className="mx-auto mt-4 max-w-2xl px-2 text-sm text-slate-400 sm:text-base">
            Monitoreá el crecimiento de la plataforma, la actividad de los
            usuarios y el comportamiento de las monedas desde un único panel.
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPIS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 lg:p-6 backdrop-blur-xl transition-all hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10">
                    <Icon className="text-cyan-400" size={26} />
                  </div>
                  <span className="text-emerald-400">{item.growth}</span>
                </div>
                <h3 className="mt-5 text-sm text-slate-400">{item.title}</h3>
                <p className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold break-words">
                  {item.value}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Gráfico + Distribución */}
        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 md:p-8 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div>
                  <h3 className="text-xl font-semibold sm:text-2xl">
                    Evolución {pair.from} → {pair.to}
                  </h3>

                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap">
                    {EXCHANGE_PAIRS.map((item) => (
                      <button
                        key={`${item.from}-${item.to}`}
                        onClick={() => setPair(item)}
                        className={`rounded-xl px-3 py-2 text-sm transition ${
                          pair.from === item.from && pair.to === item.to
                            ? "bg-cyan-500 text-slate-950"
                            : "bg-white/5 border border-white/10"
                        }`}
                      >
                        {item.from} → {item.to}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500">{lastUpdatedLabel}</p>
              </div>
            </div>

            <div className="mt-10">
              {loading ? (
                <div className="flex h-72 items-center justify-center text-slate-400">
                  Cargando historial...
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <div className="flex h-64 min-w-max items-end gap-2 sm:h-72">
                      {visibleChartData.map((item, index) => (
                        <div
                          key={item.date}
                          className="flex min-w-[55px] flex-1 flex-col items-center"
                        >
                          <div className="flex h-56 w-full flex-col justify-end sm:h-64">
                            <span className="mb-2 text-center text-[8px] font-medium text-cyan-400 sm:text-[10px] md:text-xs">
                              {item.rate.toFixed(4)}
                            </span>

                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${item.height}%` }}
                              transition={{
                                duration: 0.7,
                                delay: index * 0.05,
                                ease: "easeOut",
                              }}
                              whileHover={{
                                scale: 1.05,
                                filter: "brightness(1.15)",
                              }}
                              className="w-full rounded-t-xl bg-gradient-to-t from-cyan-500 via-sky-500 to-violet-500 shadow-lg shadow-cyan-500/20"
                            />
                          </div>

                          <span className="mt-3 text-center text-[10px] text-slate-500 sm:text-xs">
                            {new Date(item.date).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-8 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold md:text-2xl">
                Distribución de Monedas
              </h3>

              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
                Tiempo real
              </span>
            </div>

            <div className="mt-8 space-y-6">
              {distribution.map((item, index) => (
                <motion.div
                  key={item.currency}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.15,
                  }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />

                      <span className="text-sm md:text-base">
                        {item.currency}
                      </span>
                    </div>

                    <span className="text-sm font-medium text-slate-300">
                      {item.percent}%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{
                        width: `${item.percent}%`,
                      }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 1,
                        delay: index * 0.15,
                      }}
                      className={`h-full rounded-full ${item.color}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-2 text-center">
              {distribution.map((item) => (
                <div
                  key={item.currency}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <p className="text-xs text-slate-400">{item.currency}</p>

                  <p className="mt-1 text-lg font-bold">{item.percent}%</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Mercado de Divisas */}
        <motion.div
        id="mercado-divisas"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="scroll-mt-32 mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 md:p-8 backdrop-blur-xl"
        >
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h3 className="text-xl font-semibold md:text-2xl">
              Mercado de Divisas
            </h3>

            <span className="text-xs text-slate-400 md:text-sm">
              {lastUpdatedLabel}
            </span>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-slate-400">
              Cargando mercado...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-400 md:text-sm">
                    <th className="pb-4">Origen</th>
                    <th className="pb-4">Destino</th>
                    <th className="pb-4">Cotización</th>
                    <th className="pb-4">Par</th>
                    <th className="pb-4">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {marketData.map((row, index) => (
                    <motion.tr
                      key={`${row.from}-${row.to}`}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: index * 0.05,
                      }}
                      className="border-b border-white/5 transition hover:bg-white/5"
                    >
                      <td className="py-4 md:py-5">
                        <div className="font-medium">{row.from}</div>
                      </td>

                      <td>
                        <div className="font-medium">{row.to}</div>
                      </td>

                      <td>
                        <motion.span
                          key={row.price}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="font-semibold text-cyan-400"
                        >
                          {formatNumber(row.price, row.price >= 100 ? 2 : 4)}
                        </motion.span>
                      </td>

                      <td>
                        {row.from} / {row.to}
                      </td>

                      <td>
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                          Activo
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
};

export default HomeAnalytics;
