import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { paths } from "../../routes/paths";
import { toast } from "sonner";


export const VerifyCode = () => {
  const navigate = useNavigate();

  const [code, setCode] = useState("");

const handleVerify = () => {
  if (code.trim().length !== 6) {
    toast.warning("Ingresa el código completo de 6 dígitos.");
    return;
  }

  const storedCode = sessionStorage.getItem("recoveryCode");

  if (code === storedCode) {
    toast.success("Código validado correctamente.");

    setTimeout(() => {
      navigate(paths.resetPassword);
    }, 1500);
  } else {
    toast.error("Código inválido. Inténtalo nuevamente.");
  }
};
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

        <div className="mb-8 text-center">
          <ShieldCheck
            className="mx-auto mb-4 text-cyan-400"
            size={48}
          />

          <h1 className="text-2xl font-bold text-white">
            Verificar código
          </h1>

          <p className="mt-2 text-slate-400">
            Ingresá el código enviado a tu correo.
          </p>
        </div>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          placeholder="123456"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white"
        />

        <button
          onClick={handleVerify}
          className="mt-6 w-full rounded-xl bg-cyan-500 py-3 font-semibold text-black"
        >
          Verificar
        </button>
      </div>
    </main>
  );
};