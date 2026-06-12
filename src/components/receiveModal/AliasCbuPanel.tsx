import { Copy, Download, Landmark, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export interface AliasCbuPanelProps {
  alias?: string | null;
  cbu?: string | null;
  /** Muestra el aviso de seguridad debajo de las tarjetas */
  showSecurity?: boolean;
  className?: string;
}

const copyToClipboard = async (value: string | null | undefined, label: string) => {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copiado correctamente`);
  } catch {
    toast.error(`No se pudo copiar el ${label}`);
  }
};

export const AliasCbuPanel = ({
  alias,
  cbu,
  showSecurity = true,
  className = "",
}: AliasCbuPanelProps) => {
  return (
    <div className={`space-y-5 ${className}`}>
      {/* Alias */}
      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
        <div className="mb-3 flex items-center gap-2 text-cyan-400">
          <Download size={18} />
          <span className="font-medium">Alias</span>
        </div>

        <p className="break-all text-lg font-semibold text-white">
          {alias || "No disponible"}
        </p>

        <button
          type="button"
          onClick={() => copyToClipboard(alias, "Alias")}
          disabled={!alias}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-50"
        >
          <Copy size={16} />
          Copiar alias
        </button>
      </div>

      {/* CBU */}
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
        <div className="mb-3 flex items-center gap-2 text-violet-400">
          <Landmark size={18} />
          <span className="font-medium">CBU</span>
        </div>

        <p className="break-all font-mono text-lg font-semibold text-white">
          {cbu || "No disponible"}
        </p>

        <button
          type="button"
          onClick={() => copyToClipboard(cbu, "CBU")}
          disabled={!cbu}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20 disabled:opacity-50"
        >
          <Copy size={16} />
          Copiar CBU
        </button>
      </div>

      {/* Seguridad */}
      {showSecurity && (
        <div className="flex gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <ShieldCheck
            className="mt-0.5 shrink-0 text-emerald-400"
            size={20}
          />
          <div>
            <p className="font-medium text-emerald-300">
              Transferencias seguras
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Compartí únicamente estos datos para recibir dinero. Nunca
              compartas tus contraseñas o códigos de seguridad.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AliasCbuPanel;
