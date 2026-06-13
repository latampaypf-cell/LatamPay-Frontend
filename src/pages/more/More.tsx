import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSectionParam } from "../../hooks/useSectionParam";
import { MoreSidebar } from "../../components/more/MoreSidebar";
import { HistorySection } from "../../components/more/HistorySection";
import { AboutSection } from "../../components/more/AboutSection";
import { parseSection, sidebarLinks } from "../../components/more/sections";

export const More = () => {
  const { user } = useAuth();
  const { section, selectSection, clearSection } = useSectionParam(
    parseSection,
    "history",
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
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
              Más
            </span>{" "}
            opciones
          </h1>

          <div className="mt-3">
            <p className="text-lg font-semibold text-white md:text-xl">
              {user?.name ?? "Usuario"}
            </p>
            <p className="text-sm text-slate-400 md:text-base">
              {user?.email ?? "—"}
            </p>
          </div>
        </motion.div>

        <div className="mt-6 grid gap-6 md:mt-10 md:grid-cols-[260px_1fr]">
          <MoreSidebar section={section} onSelect={selectSection} />

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

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-8">
              {section === "history" && <HistorySection />}
              {section === "about" && <AboutSection />}

              {section !== null && activeLink && (
                <p className="sr-only">{activeLink.label}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default More;
