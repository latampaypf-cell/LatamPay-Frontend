import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { AliasCbuPanel } from "./AliasCbuPanel";

interface ReceiveModalProps {
  open: boolean;
  onClose: () => void;
  alias?: string;
  cbu?: string;
  title?: string;
  subtitle?: string;
  showSecurity?: boolean;
}

export const ReceiveModal = ({
  open,
  onClose,
  alias,
  cbu,
  title = "Recibir dinero",
  subtitle = "Compartí tus datos para recibir transferencias.",
  showSecurity = true,
}: ReceiveModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{
              opacity: 0,
              scale: window.innerWidth >= 640 ? 0.95 : 1,
              y: window.innerWidth >= 640 ? 30 : 100,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: window.innerWidth >= 640 ? 0.95 : 1,
              y: window.innerWidth >= 640 ? 30 : 100,
            }}
            transition={{ duration: 0.25 }}
            className="
              fixed z-50
              w-full
              sm:w-[92%]
              sm:max-w-lg

              bottom-0
              left-0

              sm:bottom-auto
              sm:left-1/2
              sm:top-1/2

              sm:-translate-x-1/2
              sm:-translate-y-1/2
            "
          >
            <div
              className="
                max-h-[90vh]
                overflow-y-auto
                sm:max-h-none
                sm:overflow-visible

                rounded-t-[2rem]
                sm:rounded-3xl

                border border-white/10
                bg-slate-950/95
                backdrop-blur-2xl
                shadow-[0_0_50px_rgba(6,182,212,0.15)]
              "
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 p-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{title}</h2>
                  <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <AliasCbuPanel
                  alias={alias}
                  cbu={cbu}
                  showSecurity={showSecurity}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
