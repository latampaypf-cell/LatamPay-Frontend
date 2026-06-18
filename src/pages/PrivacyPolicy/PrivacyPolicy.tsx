import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export function PrivacyPolicy() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute left-10 top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-5xl"
        >
          <div className="mb-10 flex items-center gap-4">
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
              <ShieldCheck className="text-cyan-400" size={28} />
            </div>

            <div>
              <h1 className="text-4xl font-bold md:text-5xl">
                Política de Privacidad
              </h1>

              <p className="mt-2 text-slate-400">
                Última actualización: Junio 2026
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] md:p-10">
            <div className="space-y-10">
              <section>
                <h2 className="mb-3 text-xl font-semibold text-cyan-400">
                  1. Información recopilada
                </h2>

                <p className="leading-8 text-slate-300">
                  Podemos recopilar información como nombre, correo electrónico,
                  número telefónico, documentos de identidad y datos necesarios
                  para la prestación de nuestros servicios.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold text-cyan-400">
                  2. Uso de la información
                </h2>

                <p className="leading-8 text-slate-300">
                  La información recopilada se utiliza para gestionar cuentas,
                  procesar transacciones, prevenir fraudes, brindar soporte y
                  mejorar la experiencia de los usuarios.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold text-cyan-400">
                  3. Protección de datos
                </h2>

                <p className="leading-8 text-slate-300">
                  Implementamos medidas de seguridad técnicas y organizativas
                  para proteger la información contra accesos no autorizados,
                  alteraciones, pérdidas o divulgaciones indebidas.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold text-cyan-400">
                  4. Compartición de información
                </h2>

                <p className="leading-8 text-slate-300">
                  No vendemos información personal. Solo compartimos datos cuando
                  sea necesario para prestar nuestros servicios, cumplir
                  obligaciones legales o con autorización expresa del usuario.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold text-cyan-400">
                  5. Cookies y tecnologías similares
                </h2>

                <p className="leading-8 text-slate-300">
                  Podemos utilizar cookies y tecnologías similares para recordar
                  preferencias, mejorar el rendimiento de la plataforma y
                  obtener estadísticas de uso.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold text-cyan-400">
                  6. Conservación de datos
                </h2>

                <p className="leading-8 text-slate-300">
                  Conservaremos la información durante el tiempo necesario para
                  cumplir las finalidades descritas en esta política y las
                  obligaciones legales aplicables.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold text-cyan-400">
                  7. Derechos del usuario
                </h2>

                <p className="leading-8 text-slate-300">
                  El usuario podrá solicitar acceso, actualización, corrección o
                  eliminación de sus datos personales conforme a la normativa
                  vigente.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold text-cyan-400">
                  8. Cambios en esta política
                </h2>

                <p className="leading-8 text-slate-300">
                  Esta política puede actualizarse periódicamente. Los cambios
                  serán publicados en esta página y entrarán en vigencia desde
                  su fecha de publicación.
                </p>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}