import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { paths } from "../../routes/paths";

export const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");

    // Mock de validación
    if (email === "demo@latampay.com") {
      sessionStorage.setItem("recoveryEmail", email);
      sessionStorage.setItem("recoveryCode", "123456");

      navigate(paths.verifyCode);
    } else {
      setError("No encontramos una cuenta asociada a este correo.");
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
            Ingresá el correo asociado a tu cuenta.
          </p>
        </div>

        <input
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white"
        />

        {error && (
          <p className="mt-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          className="mt-6 w-full rounded-xl bg-cyan-500 py-3 font-semibold text-black"
        >
          Enviar código
        </button>

        <div className="mt-6 rounded-xl bg-slate-900/50 p-4 text-xs text-slate-400">
          <p>Mock disponible:</p>
          <p>Email: demo@latampay.com</p>
          <p>Código: 123456</p>
        </div>
      </div>
    </main>
  );
};