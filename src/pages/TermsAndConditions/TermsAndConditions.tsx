import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export function TermsAndConditions() {
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
              <FileText className="text-cyan-400" size={28} />
            </div>

            <div>
              <h1 className="text-4xl font-bold md:text-5xl">
                Términos y Condiciones
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
                  1. Aceptación de los términos
                </h2>

                <p className="leading-8 text-slate-300">
                  Al registrarte y utilizar nuestra plataforma aceptas cumplir
                  con estos términos y condiciones. Si no estás de acuerdo con
                  alguna disposición aquí establecida, deberás abstenerte de
                  utilizar los servicios ofrecidos.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold text-cyan-400">
                  2. Descripción del servicio
                </h2>

                <p className="leading-8 text-slate-300">
                  La wallet permite administrar balances en diferentes monedas,
                  realizar conversiones de divisas, transferencias entre
                  usuarios, consultas de movimientos y otras funcionalidades
                  financieras habilitadas dentro de la plataforma.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold text-cyan-400">
                  3. Registro y acceso
                </h2>

                <p className="leading-8 text-slate-300">
                  El usuario deberá proporcionar información veraz, completa y
                  actualizada durante el proceso de registro. La cuenta es
                  personal e intransferible.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold text-cyan-400">
                  4. Seguridad de la cuenta
                </h2>

                <p className="leading-8 text-slate-300">
                  El usuario es responsable de mantener la confidencialidad de
                  sus credenciales de acceso. Cualquier actividad realizada
                  desde la cuenta será considerada realizada por el titular.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold text-cyan-400">
                  5. Conversión de monedas
                </h2>

                <p className="leading-8 text-slate-300">
                  Los tipos de cambio mostrados dentro de la plataforma pueden
                  variar de acuerdo con las condiciones del mercado. Antes de
                  confirmar una operación, el usuario podrá visualizar el tipo
                  de cambio aplicable y las comisiones correspondientes.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold text-cyan-400">
                  6. Comisiones y cargos
                </h2>

                <p className="leading-8 text-slate-300">
                  Algunas operaciones pueden generar cargos o comisiones. Dichos
                  importes serán informados previamente al usuario antes de la
                  confirmación de la transacción.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold text-cyan-400">
                  7. Suspensión o cancelación
                </h2>

                <p className="leading-8 text-slate-300">
                  La plataforma podrá suspender temporal o definitivamente una
                  cuenta en caso de detectar actividades fraudulentas,
                  incumplimientos legales o violaciones a estos términos.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold text-cyan-400">
                  8. Limitación de responsabilidad
                </h2>

                <p className="leading-8 text-slate-300">
                  No seremos responsables por pérdidas derivadas de fallas de
                  terceros, interrupciones de internet, errores de entidades
                  externas o uso indebido de la cuenta por parte del usuario.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold text-cyan-400">
                  9. Modificaciones
                </h2>

                <p className="leading-8 text-slate-300">
                  Nos reservamos el derecho de actualizar estos términos en
                  cualquier momento. Las modificaciones serán publicadas en esta
                  página y entrarán en vigor desde su publicación.
                </p>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}