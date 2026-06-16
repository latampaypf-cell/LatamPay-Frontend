import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  Construction,
  PiggyBank,
  PlusCircle,
  Target,
  Wallet,
} from "lucide-react";

const PLACEHOLDER_CATEGORIES = [
  { label: "Gastos generales", icon: Wallet },
  { label: "Ahorro mensual", icon: Target },
  { label: "Transferencias", icon: ArrowLeftRight },
];

export type BudgetsSectionProps = {
  className?: string;
};

export const BudgetsSection = ({ className = "" }: BudgetsSectionProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
      className={className}
    >
      <div className="rounded-3xl border border-dashed border-violet-500/30 bg-violet-500/5 p-8 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10">
              <PiggyBank size={26} className="text-violet-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold">Objetivos</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                  <Construction size={12} />
                  Próximamente
                </span>
              </div>
              <p className="mt-2 max-w-xl text-sm text-slate-200">
                Vas a poder definir metas mensuales por categoría, hacer
                seguimiento de tus gastos y recibir alertas cuando estés cerca
                del límite.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled
            aria-disabled
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-violet-500/40 bg-violet-500/15 px-4 py-2 text-sm font-medium text-violet-100 opacity-90"
          >
            <PlusCircle size={16} />
            Crear objetivo
          </button>
        </div>

        {/* Placeholders de categorías */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PLACEHOLDER_CATEGORIES.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-slate-900/40 p-5"
            >
              <div className="flex items-center gap-2 text-slate-100">
                <Icon size={16} className="text-violet-300" />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-200">— / —</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-0 bg-violet-500/40" />
              </div>
              <p className="mt-3 text-xs text-slate-300">
                Sin objetivo definido
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default BudgetsSection;
