import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

export const AboutSection = () => (
  <motion.div
    key="about"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 md:h-16 md:w-16">
        <Wallet size={28} className="text-cyan-400 md:h-8 md:w-8" />
      </div>
      <div>
        <h2 className="text-xl font-bold md:text-2xl">Acerca de LatamPay</h2>
        <p className="text-xs text-slate-400 md:text-sm">
          Nuestra misión y propuesta de valor
        </p>
      </div>
    </div>

    <div className="mt-6 space-y-4 text-sm text-slate-300 md:mt-8 md:text-base">
      <p>
        LatamPay es una plataforma financiera pensada para América Latina.
        Permite mover, convertir y administrar tu dinero en distintas monedas
        de la región de forma simple, rápida y segura.
      </p>
      <p>
        Nuestro objetivo es eliminar las barreras del intercambio entre países,
        ofreciendo conversiones transparentes entre pesos argentinos, pesos
        colombianos y bolívares venezolanos, con cotizaciones claras y sin
        sorpresas.
      </p>
      <p>
        Combinamos tecnología moderna, soporte impulsado por IA y estándares de
        seguridad para que confiar en nosotros sea natural.
      </p>
    </div>

    <div className="mt-6 grid gap-3 md:mt-8 md:grid-cols-3 md:gap-4">
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
        <p className="text-3xl font-bold text-cyan-400">3</p>
        <p className="mt-1 text-sm text-slate-400">Monedas soportadas</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
        <p className="text-3xl font-bold text-cyan-400">24/7</p>
        <p className="mt-1 text-sm text-slate-400">Disponibilidad</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
        <p className="text-3xl font-bold text-cyan-400">100%</p>
        <p className="mt-1 text-sm text-slate-400">Cotizaciones simuladas</p>
      </div>
    </div>
  </motion.div>
);

export default AboutSection;
