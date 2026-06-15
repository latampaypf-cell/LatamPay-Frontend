import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatPanel } from "./ChatPanel";

type ChatBotModalProps = {
  open: boolean;
  onClose: () => void;
  subtitle?: string;
};

export const ChatBotModal = ({ open, onClose, subtitle }: ChatBotModalProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label="Asistente virtual LatamPay"
            className="
              fixed z-[95]
              inset-0
              flex items-stretch
              sm:items-center sm:justify-center sm:p-4
            "
          >
            <ChatPanel
              onClose={onClose}
              subtitle={subtitle}
              className="h-full w-full !rounded-none sm:h-[80vh] sm:max-h-[640px] sm:max-w-lg sm:!rounded-3xl"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatBotModal;
