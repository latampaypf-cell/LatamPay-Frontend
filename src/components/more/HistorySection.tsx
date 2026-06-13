import { motion } from "framer-motion";
import { History } from "lucide-react";
import { useWallet } from "../../context/WalletContext";
import { TransactionsExplorer } from "../transactions/TransactionsExplorer";

export const HistorySection = () => {
  const { transactions } = useWallet();

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 md:h-16 md:w-16">
          <History size={28} className="text-cyan-400 md:h-8 md:w-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold md:text-2xl">Historial</h2>
          <p className="text-xs text-slate-400 md:text-sm">
            Últimos movimientos de tu cuenta
          </p>
        </div>
      </div>

      <div className="mt-6 md:mt-8">
        <TransactionsExplorer transactions={transactions} />
      </div>
    </motion.div>
  );
};

export default HistorySection;
