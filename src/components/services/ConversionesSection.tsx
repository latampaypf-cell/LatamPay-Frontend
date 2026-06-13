import { motion } from "framer-motion";
import { CurrencyConverter } from "./CurrencyConverter";
import { LiveRatesGrid } from "../exchange/LiveRatesGrid";
import type { Currency } from "../../types/wallet/wallet.types";

const QUOTE_PAIRS: { from: Currency; to: Currency; symbol: string }[] = [
  { from: "ARS", to: "COP", symbol: "$" },
  { from: "ARS", to: "VES", symbol: "Bs. " },
  { from: "COP", to: "VES", symbol: "Bs. " },
  { from: "COP", to: "ARS", symbol: "$" },
  { from: "VES", to: "ARS", symbol: "$" },
  { from: "VES", to: "COP", symbol: "$" },
];

export const ConversionesSection = () => (
  <motion.div
    key="conversiones"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <CurrencyConverter />

    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold">Cotizaciones del día</h2>
      </div>

      <LiveRatesGrid pairs={QUOTE_PAIRS} variant="detailed" showFooter />
    </section>
  </motion.div>
);

export default ConversionesSection;
