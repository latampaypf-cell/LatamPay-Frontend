import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { paths } from "../../routes/paths";
import {
  clearRecoveryState,
  isCodeVerified,
} from "../../services/sesMock";

export const ResetPassword = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!isCodeVerified()) {
      toast.error("Verificá el código antes de cambiar la contraseña.");
      navigate(paths.forgotPassword, { replace: true });
    }
  }, [navigate]);

  const handleReset = () => {
    if (!password.trim() || !confirmPassword.trim()) {
      toast.warning("Debes completar todos los campos.");
      return;
    }

    if (password.length < 8) {
      toast.warning("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    toast.success("Contraseña actualizada correctamente.");
    clearRecoveryState();

    setTimeout(() => {
      navigate(paths.login);
    }, 1500);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <Lock
            className="mx-auto mb-4 text-cyan-400"
            size={48}
          />

          <h1 className="text-2xl font-bold text-white">
            Nueva contraseña
          </h1>

          <p className="mt-2 text-slate-400">
            Elegí una contraseña segura para proteger tu cuenta.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleReset();
              }}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleReset}
          className="mt-6 w-full rounded-xl bg-cyan-500 py-3 font-semibold text-black transition hover:bg-cyan-400"
        >
          Actualizar contraseña
        </button>
      </div>
    </main>
  );
};
