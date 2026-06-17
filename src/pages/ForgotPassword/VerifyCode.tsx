import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { paths } from "../../routes/paths";
import {
  getRecoveryEmail,
  getRecoveryExpiresAt,
  sendRecoveryCode,
  verifyRecoveryCode,
} from "../../services/sesMock";

const formatRemaining = (ms: number): string => {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const VerifyCode = () => {
  const navigate = useNavigate();

  const initialEmail = useMemo(() => getRecoveryEmail(), []);
  const [code, setCode] = useState("");
  const [resending, setResending] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(
    () => getRecoveryExpiresAt(),
  );
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!initialEmail) {
      toast.error("Necesitamos tu correo primero.");
      navigate(paths.forgotPassword, { replace: true });
    }
  }, [initialEmail, navigate]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = expiresAt ? expiresAt - now : 0;
  const expired = remainingMs <= 0;

  const handleVerify = () => {
    if (code.trim().length !== 6) {
      toast.warning("Ingresá el código completo de 6 dígitos.");
      return;
    }

    const result = verifyRecoveryCode(code);
    if (result.ok) {
      toast.success("Código validado correctamente.");
      setTimeout(() => navigate(paths.resetPassword), 800);
      return;
    }

    if (result.reason === "expired") {
      toast.error("El código expiró. Pedí uno nuevo.");
      setExpiresAt(null);
    } else if (result.reason === "missing") {
      toast.error("No hay un código pendiente. Solicitá uno nuevo.");
      navigate(paths.forgotPassword, { replace: true });
    } else {
      toast.error("Código inválido. Intentá nuevamente.");
    }
  };

  const handleResend = async () => {
    if (!initialEmail) return;
    setResending(true);
    try {
      const result = await sendRecoveryCode(initialEmail);
      setExpiresAt(result.expiresAt);
      setCode("");
      toast.success(`Nuevo código enviado a ${result.maskedEmail}.`);
      toast.message(`Modo demo — código: ${result.code}`, {
        duration: 8000,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos reenviar el código.";
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <button
          onClick={() => navigate(paths.forgotPassword)}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-cyan-400"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <div className="mb-8 text-center">
          <ShieldCheck
            className="mx-auto mb-4 text-cyan-400"
            size={48}
          />

          <h1 className="text-2xl font-bold text-white">
            Verificar código
          </h1>

          <p className="mt-2 text-slate-400">
            Te enviamos un código de 6 dígitos a
          </p>
          {initialEmail && (
            <p className="mt-1 font-mono text-sm text-cyan-300">
              {initialEmail}
            </p>
          )}
        </div>

        <input
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") handleVerify();
          }}
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none"
        />

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>
            {expired
              ? "Código vencido"
              : `Expira en ${formatRemaining(remainingMs)}`}
          </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="flex items-center gap-1 text-cyan-300 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Reenviando...
              </>
            ) : (
              "Reenviar código"
            )}
          </button>
        </div>

        <button
          onClick={handleVerify}
          disabled={expired}
          className="mt-6 w-full rounded-xl bg-cyan-500 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Verificar
        </button>
      </div>
    </main>
  );
};
