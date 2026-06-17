import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Copy,
  IdCard,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "../input/Input";
import { Button } from "../button/Button";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/wallet";
import {
  passwordSchema,
  profileSchema,
  type PasswordFormData,
  type ProfileFormData,
} from "../../schemas/profile.schema";
import { apiUpdateProfile } from "../../services/auth.api";

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

type TabId = "perfil" | "password";

const TABS: { id: TabId; label: string; icon: typeof User }[] = [
  { id: "perfil", label: "Datos personales", icon: User },
  { id: "password", label: "Contraseña", icon: Lock },
];

const copyToClipboard = async (value: string, label: string) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copiado correctamente`);
  } catch {
    toast.error(`No se pudo copiar el ${label}`);
  }
};

export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const { user, token, setUser } = useAuth();
  const { alias, cbu, refresh: refreshWallet } = useWallet();

  const [tab, setTab] = useState<TabId>("perfil");

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      name: user?.name ?? "",
      alias: alias ?? "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    profileForm.reset({
      name: user?.name ?? "",
      alias: alias ?? "",
    });
    passwordForm.reset({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setTab("perfil");
    // Intencional: solo al abrir el modal, no en cada cambio de user/alias
    // (evita pisar lo que el usuario está tipeando tras un save).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmitProfile = async (data: ProfileFormData) => {
    if (!token) return;
    const payload: { name?: string; alias?: string } = {};
    if (data.name !== (user?.name ?? "")) payload.name = data.name;
    if (data.alias !== (alias ?? "")) payload.alias = data.alias;

    if (!payload.name && !payload.alias) {
      toast.info("No hay cambios para guardar.");
      return;
    }

    try {
      const updated = await apiUpdateProfile(token, payload);
      setUser({
        id: updated.id,
        email: updated.email,
        role: updated.role,
        name: updated.name,
      });
      await refreshWallet();
      profileForm.reset({
        name: updated.name ?? "",
        alias: updated.alias ?? "",
      });
      toast.success("Perfil actualizado correctamente.");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "No pudimos actualizar el perfil.";
      toast.error(message);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    if (!token) return;
    try {
      await apiUpdateProfile(token, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Contraseña actualizada correctamente.");
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "No pudimos actualizar la contraseña.";
      toast.error(message);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            initial={{
              opacity: 0,
              scale: window.innerWidth >= 640 ? 0.95 : 1,
              y: window.innerWidth >= 640 ? 30 : 100,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: window.innerWidth >= 640 ? 0.95 : 1,
              y: window.innerWidth >= 640 ? 30 : 100,
            }}
            transition={{ duration: 0.25 }}
            className="
              fixed z-50
              w-full
              sm:w-[92%]
              sm:max-w-2xl

              bottom-0
              left-0

              sm:bottom-auto
              sm:left-1/2
              sm:top-1/2

              sm:-translate-x-1/2
              sm:-translate-y-1/2
            "
          >
            <div
              className="
                max-h-[90vh]
                overflow-y-auto
                sm:max-h-[85vh]

                rounded-t-[2rem]
                sm:rounded-3xl

                border border-white/10
                bg-slate-950/95
                backdrop-blur-2xl
                shadow-[0_0_50px_rgba(6,182,212,0.15)]
              "
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 p-6">
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                    <Sparkles size={22} className="text-cyan-400" />
                    Configuración
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Gestioná los datos de tu cuenta y tu seguridad.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Read-only account info */}
              <div className="grid gap-3 border-b border-white/10 p-6 sm:grid-cols-2">
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={user?.email ?? "—"}
                />
                <InfoRow
                  icon={UserRound}
                  label="Rol"
                  value={user?.role ?? "—"}
                />
                <InfoRow
                  icon={IdCard}
                  label="ID de usuario"
                  value={user?.id ?? "—"}
                  monospace
                  copyable
                />
                <InfoRow
                  icon={ShieldCheck}
                  label="CBU"
                  value={cbu ?? "No disponible"}
                  monospace
                  copyable={Boolean(cbu)}
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-white/10 px-4 pt-4">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={`-mb-px flex items-center gap-2 rounded-t-xl border-b-2 px-4 py-3 text-sm font-medium transition ${
                        active
                          ? "border-cyan-400 text-cyan-400"
                          : "border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Icon size={16} />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div className="p-6">
                {tab === "perfil" && (
                  <form
                    onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                    className="space-y-4"
                    noValidate
                  >
                    <Input
                      label="Nombre"
                      leftIcon={User}
                      placeholder="Tu nombre"
                      autoComplete="name"
                      error={profileForm.formState.errors.name?.message}
                      {...profileForm.register("name")}
                    />
                    <Input
                      label="Alias"
                      leftIcon={Sparkles}
                      placeholder="mi.alias"
                      autoComplete="off"
                      hint="Tu alias para recibir transferencias."
                      error={profileForm.formState.errors.alias?.message}
                      {...profileForm.register("alias")}
                    />

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        isLoading={profileForm.formState.isSubmitting}
                        loadingText="Guardando…"
                        disabled={!profileForm.formState.isDirty}
                      >
                        Guardar cambios
                      </Button>
                    </div>
                  </form>
                )}

                {tab === "password" && (
                  <form
                    onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                    className="space-y-4"
                    noValidate
                  >
                    <Input
                      label="Contraseña actual"
                      type="password"
                      togglePassword
                      leftIcon={KeyRound}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      error={
                        passwordForm.formState.errors.currentPassword?.message
                      }
                      {...passwordForm.register("currentPassword")}
                    />
                    <Input
                      label="Nueva contraseña"
                      type="password"
                      togglePassword
                      leftIcon={Lock}
                      placeholder="Nueva contraseña"
                      autoComplete="new-password"
                      hint="Mínimo 8 caracteres, mayúscula, número y símbolo."
                      error={passwordForm.formState.errors.newPassword?.message}
                      {...passwordForm.register("newPassword")}
                    />
                    <Input
                      label="Confirmar nueva contraseña"
                      type="password"
                      togglePassword
                      leftIcon={Lock}
                      placeholder="Repetí la nueva contraseña"
                      autoComplete="new-password"
                      error={
                        passwordForm.formState.errors.confirmNewPassword
                          ?.message
                      }
                      {...passwordForm.register("confirmNewPassword")}
                    />

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        isLoading={passwordForm.formState.isSubmitting}
                        loadingText="Actualizando…"
                        disabled={!passwordForm.formState.isValid}
                      >
                        Cambiar contraseña
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

type InfoRowProps = {
  icon: typeof User;
  label: string;
  value: string;
  monospace?: boolean;
  copyable?: boolean;
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
  monospace,
  copyable,
}: InfoRowProps) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
      <Icon size={14} />
      {label}
    </div>
    <div className="flex items-center justify-between gap-3">
      <p
        className={`break-all text-sm text-white ${monospace ? "font-mono" : ""}`}
      >
        {value}
      </p>
      {copyable && (
        <button
          type="button"
          onClick={() => copyToClipboard(value, label)}
          className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-cyan-400"
          aria-label={`Copiar ${label}`}
        >
          <Copy size={14} />
        </button>
      )}
    </div>
  </div>
);

export default SettingsModal;
