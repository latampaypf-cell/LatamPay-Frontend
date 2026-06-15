import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  RefreshCcw,
  Send,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import { useChatBot } from "../../context/ChatBotContext";
import type { ChatMessage } from "../../types/chat/chat.types";

const MAX_LEN = 500;

const SUGGESTIONS_PUBLIC = [
  "¿Qué es LatamPay?",
  "¿Cómo creo una cuenta?",
  "¿Qué monedas puedo usar?",
];
const SUGGESTIONS_PRIVATE = [
  "¿Cuál es mi saldo actual?",
  "¿Cómo convierto monedas?",
  "Mostrame mis últimos movimientos",
];

export type ChatPanelProps = {
  /** Si se renderiza dentro de un popup/modal, muestra el botón de cerrar. */
  onClose?: () => void;
  /** Estilo del contenedor. `embedded` = sin altura fija, `floating` = panel con altura propia. */
  variant?: "embedded" | "floating";
  /** Texto opcional bajo el título. */
  subtitle?: string;
  className?: string;
};

export const ChatPanel = ({
  onClose,
  variant = "floating",
  subtitle,
  className = "",
}: ChatPanelProps) => {
  const {
    messages,
    isSending,
    error,
    isAuthenticated,
    sendMessage,
    reset,
  } = useChatBot();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isSending) return;
      const text = input;
      setInput("");
      await sendMessage(text);
    },
    [input, isSending, sendMessage],
  );

  const handleSuggestion = (text: string) => {
    if (isSending) return;
    void sendMessage(text);
  };

  const suggestions = isAuthenticated
    ? SUGGESTIONS_PRIVATE
    : SUGGESTIONS_PUBLIC;

  const containerHeight =
    variant === "floating"
      ? "h-[80vh] max-h-[640px] sm:h-[560px]"
      : "h-[560px] md:h-[640px]";

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-3xl border border-cyan-500/20 bg-slate-950/95 shadow-[0_0_50px_rgba(6,182,212,0.18)] backdrop-blur-xl ${containerHeight} ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-violet-500/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/15 ring-1 ring-cyan-500/30">
              <Bot size={20} className="text-cyan-300" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
            </span>
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-semibold text-white">
              LatamPay AI
              <Sparkles size={14} className="text-cyan-300" />
            </p>
            <p className="text-xs text-slate-400">
              {subtitle ??
                (isAuthenticated
                  ? "Te ayudo con tu cuenta en tiempo real."
                  : "Te ayudo a conocer LatamPay.")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={reset}
              title="Reiniciar conversación"
              aria-label="Reiniciar conversación"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-cyan-300"
            >
              <RefreshCcw size={16} />
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar chat"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Mensajes */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5"
      >
        {messages.length === 0 && <EmptyState />}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <MessageBubble key={`${idx}-${msg.role}`} message={msg} />
          ))}
        </AnimatePresence>

        {isSending && <TypingIndicator />}

        {error && !isSending && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
          >
            <TriangleAlert size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
      </div>

      {/* Sugerencias */}
      {messages.length === 0 && !isSending && (
        <div className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-3">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSuggestion(s)}
              className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 text-xs text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/10"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-white/10 bg-slate-950/80 p-3"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 transition focus-within:border-cyan-500/40">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_LEN))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isSending) {
                  const text = input;
                  setInput("");
                  void sendMessage(text);
                }
              }
            }}
            rows={1}
            placeholder="Escribí tu consulta…"
            className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            aria-label="Enviar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-slate-500">
          <span>Enter para enviar · Shift+Enter para nueva línea</span>
          <span>
            {input.length}/{MAX_LEN}
          </span>
        </div>
      </form>
    </div>
  );
};

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex h-full flex-col items-center justify-center gap-2 px-4 py-8 text-center"
  >
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-violet-500/20 ring-1 ring-cyan-500/30">
      <Sparkles size={26} className="text-cyan-300" />
    </div>
    <h3 className="mt-1 text-base font-semibold text-white">
      Hola, soy LatamPay AI
    </h3>
    <p className="max-w-xs text-xs text-slate-400">
      Hacé tu consulta o tocá una sugerencia para empezar.
    </p>
  </motion.div>
);

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[85%] gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        <div
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
            isUser
              ? "bg-cyan-500/15 ring-1 ring-cyan-400/30"
              : "bg-gradient-to-br from-cyan-500/25 to-violet-500/25 ring-1 ring-cyan-400/30"
          }`}
        >
          {isUser ? (
            <span className="text-[10px] font-bold text-cyan-200">Vos</span>
          ) : (
            <Bot size={14} className="text-cyan-200" />
          )}
        </div>
        <div
          className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "rounded-tr-sm bg-cyan-500 text-slate-950"
              : "rounded-tl-sm border border-white/10 bg-white/5 text-slate-100"
          }`}
        >
          {message.text}
        </div>
      </div>
    </motion.div>
  );
};

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-2 px-2"
  >
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/25 to-violet-500/25 ring-1 ring-cyan-400/30">
      <Bot size={14} className="text-cyan-200" />
    </div>
    <div className="flex gap-1 rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3">
      <Dot delay={0} />
      <Dot delay={0.15} />
      <Dot delay={0.3} />
    </div>
  </motion.div>
);

const Dot = ({ delay }: { delay: number }) => (
  <motion.span
    className="block h-1.5 w-1.5 rounded-full bg-cyan-300"
    animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
    transition={{
      duration: 0.9,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
  />
);

export default ChatPanel;
