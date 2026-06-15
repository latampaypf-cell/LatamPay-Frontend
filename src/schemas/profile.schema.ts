import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre no puede superar los 100 caracteres.")
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "El nombre solo puede contener letras."),
  alias: z
    .string()
    .trim()
    .toLowerCase()
    .refine(
      (v) =>
        v === "" ||
        (v.length >= 4 && v.length <= 50 && /^[a-z0-9.]+$/.test(v)),
      "Entre 4 y 50 caracteres, solo minúsculas, números y puntos.",
    ),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresá tu contraseña actual."),
    newPassword: z
      .string()
      .min(8, "Debe tener al menos 8 caracteres.")
      .max(100, "Máximo 100 caracteres.")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula.")
      .regex(/[0-9]/, "Debe contener al menos un número.")
      .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial.")
      .refine((v) => !/\s/.test(v), "La contraseña no puede contener espacios."),
    confirmNewPassword: z.string().min(1, "Confirmá la nueva contraseña."),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmNewPassword"],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "La nueva contraseña debe ser distinta a la actual.",
    path: ["newPassword"],
  });

export type PasswordFormData = z.infer<typeof passwordSchema>;
