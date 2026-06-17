import { useState } from "react";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { paths } from "../../routes/paths";
import {
  sendRecoveryCode,
  VERIFIED_EMAILS_DEMO,
} from "../../services/sesMock";

export const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Ingresá tu correo para continuar.");
      return;
    }

    setLoading(true);
    try {
      const result = await sendRecoveryCode(trimmed);
      toast.success(`Código enviado a ${result.maskedEmail}.`);
      toast.message(`Modo demo — código: ${result.code}`, {
        duration: 8000,
      });
      navigate(paths.verifyCode);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos enviar el código en este momento.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-cyan-400"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <div className="mb-8 text-center">
          <Mail className="mx-auto mb-4 text-cyan-400" size={48} />

          <h1 className="text-2xl font-bold text-white">
            Recuperar contraseña
          </h1>

          <p className="mt-2 text-slate-400">
            Ingresá el correo verificado en AWS SES asociado a tu cuenta.
          </p>
        </div>

        <input
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          disabled={loading}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) handleSubmit();
          }}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none disabled:opacity-60"
        />

        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Enviando código...
            </>
          ) : (
            "Enviar código"
          )}
        </button>

        <div className="mt-6 rounded-xl bg-slate-900/50 p-4 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">
            Emails verificados en AWS SES (demo):
          </p>
          <ul className="mt-1 space-y-0.5">
            {VERIFIED_EMAILS_DEMO.map((mail) => (
              <li key={mail} className="font-mono">
                {mail}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
};
