import { motion } from "framer-motion";
import { Bot, Clock, ShieldCheck } from "lucide-react";
import { ChatPanel } from "../chatbot/ChatPanel";

export const SupportSection = () => (
  <div className="space-y-5">
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-start gap-4"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
        <Bot size={22} className="text-cyan-300" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-white md:text-2xl">
          Soporte con LatamPay AI
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Tu asistente personal con acceso a tu cuenta. Preguntale por tu saldo,
          tus movimientos, cotizaciones o cualquier duda de la plataforma.
        </p>
      </div>
    </motion.div>

    <div className="grid gap-3 sm:grid-cols-3">
      <Hint
        icon={Clock}
        title="24/7"
        text="Siempre disponible para ayudarte."
      />
      <Hint
        icon={ShieldCheck}
        title="Privado"
        text="Tus datos se procesan de forma segura."
      />
      <Hint
        icon={Bot}
        title="Personalizado"
        text="Tiene contexto de tu cuenta real."
      />
    </div>

    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35 }}
    >
      <ChatPanel variant="embedded" />
    </motion.div>
  </div>
);

type HintProps = {
  icon: typeof Bot;
  title: string;
  text: string;
};

const Hint = ({ icon: Icon, title, text }: HintProps) => (
  <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
      <Icon size={16} className="text-cyan-300" />
    </div>
    <div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-slate-400">{text}</p>
    </div>
  </div>
);

export default SupportSection;
