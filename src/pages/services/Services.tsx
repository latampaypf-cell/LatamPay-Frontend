import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useSectionParam } from "../../hooks/useSectionParam";
import { ServicesSidebar } from "../../components/services/ServicesSidebar";
import { ConversionesSection } from "../../components/services/ConversionesSection";
import { BudgetsSection } from "../../components/budgets/BudgetsSection";
import { parseSection, sidebarLinks } from "../../components/services/sections";

export const Services = () => {
  const { section, selectSection, clearSection } = useSectionParam(
    parseSection,
    "conversiones",
  );
  const activeLink = sidebarLinks.find((l) => l.id === section);

  return (
    <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-slate-950 px-4 py-8 text-white md:px-6 md:py-12">
      {/* Fondo animado */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header — en mobile se oculta cuando estamos dentro de una sección */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={section !== null ? "hidden md:block" : ""}
        >
          <h1 className="text-3xl font-bold md:text-5xl">
            Nuestros{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
              Servicios
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Convertí entre pesos argentinos, pesos colombianos y bolívares
            venezolanos con cotizaciones actualizadas desde nuestra base de
            datos.
          </p>
        </motion.div>

        <div className="mt-6 grid gap-6 md:mt-10 md:grid-cols-[260px_1fr]">
          <ServicesSidebar section={section} onSelect={selectSection} />

          <div className={section === null ? "hidden md:block" : "block"}>
            {section !== null && (
              <button
                type="button"
                onClick={clearSection}
                className="mb-5 flex items-center gap-2 text-sm text-slate-300 transition hover:text-cyan-400 md:hidden"
              >
                <ArrowLeft size={18} />
                Volver al menú
              </button>
            )}

            {section === "conversiones" && <ConversionesSection />}
            {section === "objetivos" && <BudgetsSection />}

            {section !== null && activeLink && (
              <p className="sr-only">{activeLink.label}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
