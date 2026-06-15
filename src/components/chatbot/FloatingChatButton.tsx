import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, X } from "lucide-react";
import { ChatPanel } from "./ChatPanel";
import { useChatBot } from "../../context/ChatBotContext";

export const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages } = useChatBot();
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Cierra al hacer click afuera (solo en desktop, donde el panel es flotante).
  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (window.innerWidth < 640) return;
      if (containerRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isOpen]);

  const unreadHint = messages.length > 0 && !isOpen;

  return (
    <>
      {/* Backdrop solo en mobile (desktop usa click-fuera) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm sm:hidden"
          />
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3"
      >
        {/* Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="chat-panel"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="
                fixed inset-0
                sm:static sm:inset-auto
                sm:h-[560px] sm:w-[400px]
                origin-bottom-right
              "
            >
              <ChatPanel
                onClose={close}
                className="h-full w-full !rounded-none sm:!rounded-3xl"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB */}
        <motion.button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? "Cerrar asistente" : "Abrir asistente"}
          aria-expanded={isOpen}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className={`group relative h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 text-slate-950 shadow-[0_8px_30px_rgba(6,182,212,0.45)] ring-2 ring-cyan-300/40 transition hover:shadow-[0_10px_40px_rgba(6,182,212,0.55)] ${
            isOpen ? "hidden sm:flex" : "flex"
          }`}
        >
          {/* Halo pulsante */}
          <span className="pointer-events-none absolute inset-0 rounded-full">
            <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/30" />
          </span>

          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.span
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="relative"
              >
                <X size={22} strokeWidth={2.5} />
              </motion.span>
            ) : (
              <motion.span
                key="bot"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="relative"
              >
                <Bot size={24} strokeWidth={2.2} />
              </motion.span>
            )}
          </AnimatePresence>

          {/* Punto de "hay mensajes" */}
          {unreadHint && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-slate-950 ring-2 ring-slate-950">
              <MessageCircle size={10} strokeWidth={3} />
            </span>
          )}

          {/* Tooltip desktop */}
          {!isOpen && (
            <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-xl border border-white/10 bg-slate-900/95 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:block">
              Hablar con LatamPay AI
            </span>
          )}
        </motion.button>
      </div>
    </>
  );
};

export default FloatingChatButton;
