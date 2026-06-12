import { describe, expect, it } from "vitest";
import { registerSchema } from "../../schemas/register.schema";

const baseValidInput = {
  name: "Juan Perez",
  email: "juan@example.com",
  password: "Password1!",
  confirmPassword: "Password1!",
};

const parseError = (input: unknown) => {
  const result = registerSchema.safeParse(input);
  if (result.success) throw new Error("Se esperaba que el parse fallara.");
  return result.error.issues;
};

const findIssue = (input: unknown, path: string) =>
  parseError(input).find((i) => i.path[0] === path);

describe("registerSchema", () => {
  describe("casos válidos", () => {
    it("acepta un registro completo y válido", () => {
      const result = registerSchema.safeParse(baseValidInput);
      expect(result.success).toBe(true);
    });

    it("normaliza el email a lowercase y le hace trim", () => {
      const result = registerSchema.safeParse({
        ...baseValidInput,
        email: "  JUAN@Example.COM  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("juan@example.com");
      }
    });

    it("acepta nombres con acentos y eñe", () => {
      const result = registerSchema.safeParse({
        ...baseValidInput,
        name: "José Iñárritu",
      });
      expect(result.success).toBe(true);
    });

    it("acepta dominios .com.ar", () => {
      const result = registerSchema.safeParse({
        ...baseValidInput,
        email: "user@empresa.com.ar",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("validación de name", () => {
    it("rechaza nombre vacío", () => {
      const issue = findIssue({ ...baseValidInput, name: "" }, "name");
      expect(issue?.message).toBe("El nombre es muy corto");
    });

    it("rechaza nombre de 1 carácter", () => {
      const issue = findIssue({ ...baseValidInput, name: "A" }, "name");
      expect(issue?.message).toBe("El nombre es muy corto");
    });

    it("rechaza nombre de más de 50 caracteres", () => {
      const issue = findIssue(
        { ...baseValidInput, name: "A".repeat(51) },
        "name",
      );
      expect(issue?.message).toBe("El nombre es muy largo");
    });

    it("rechaza nombre con números", () => {
      const issue = findIssue({ ...baseValidInput, name: "Juan2" }, "name");
      expect(issue?.message).toBe("El nombre solo puede contener letras");
    });

    it("rechaza nombre con caracteres especiales", () => {
      const issue = findIssue({ ...baseValidInput, name: "Juan@" }, "name");
      expect(issue?.message).toBe("El nombre solo puede contener letras");
    });

    it("rechaza nombre con espacios dobles entre palabras", () => {
      const issue = findIssue(
        { ...baseValidInput, name: "Juan  Perez" },
        "name",
      );
      expect(issue?.message).toBe("No puede tener espacios dobles");
    });
  });

  describe("validación de email", () => {
    it("rechaza email sin @", () => {
      const issue = findIssue(
        { ...baseValidInput, email: "noemail" },
        "email",
      );
      expect(issue).toBeDefined();
    });

    it("rechaza email con TLD no permitido", () => {
      const issue = findIssue(
        { ...baseValidInput, email: "user@example.xyz" },
        "email",
      );
      expect(issue?.message).toBe("Dominio inválido o no permitido.");
    });

    it("rechaza emails de dominios desechables", () => {
      const issue = findIssue(
        { ...baseValidInput, email: "user@mailinator.com" },
        "email",
      );
      expect(issue?.message).toBe("No se permiten emails temporales.");
    });

    it("rechaza email con puntos consecutivos en el dominio", () => {
      const issue = findIssue(
        { ...baseValidInput, email: "user@bad..com" },
        "email",
      );
      expect(issue).toBeDefined();
    });

    it("rechaza email con local part muy corto", () => {
      const issue = findIssue(
        { ...baseValidInput, email: "ab@example.com" },
        "email",
      );
      expect(issue?.message).toBe("Email inválido.");
    });

    it("rechaza email con local que arranca con punto", () => {
      const issue = findIssue(
        { ...baseValidInput, email: ".user@example.com" },
        "email",
      );
      expect(issue).toBeDefined();
    });

    it("rechaza email de más de 254 caracteres", () => {
      const longLocal = "a".repeat(250);
      const issue = findIssue(
        { ...baseValidInput, email: `${longLocal}@example.com` },
        "email",
      );
      expect(issue?.message).toBe("El email es demasiado largo.");
    });
  });

  describe("validación de password", () => {
    it("rechaza password de menos de 6 caracteres", () => {
      const issue = findIssue(
        { ...baseValidInput, password: "Aa1!", confirmPassword: "Aa1!" },
        "password",
      );
      expect(issue?.message).toBe("Mínimo 6 caracteres");
    });

    it("rechaza password sin mayúsculas", () => {
      const issue = findIssue(
        {
          ...baseValidInput,
          password: "password1!",
          confirmPassword: "password1!",
        },
        "password",
      );
      expect(issue?.message).toBe("Debe contener al menos una mayúscula");
    });

    it("rechaza password sin números", () => {
      const issue = findIssue(
        {
          ...baseValidInput,
          password: "Password!",
          confirmPassword: "Password!",
        },
        "password",
      );
      expect(issue?.message).toBe("Debe contener al menos un número");
    });

    it("rechaza password sin caracter especial", () => {
      const issue = findIssue(
        {
          ...baseValidInput,
          password: "Password1",
          confirmPassword: "Password1",
        },
        "password",
      );
      expect(issue?.message).toBe(
        "Debe contener al menos un carácter especial",
      );
    });

    it("rechaza password con espacios", () => {
      const issue = findIssue(
        {
          ...baseValidInput,
          password: "Pass word1!",
          confirmPassword: "Pass word1!",
        },
        "password",
      );
      expect(issue?.message).toBe("La contraseña no puede contener espacios");
    });

    it("rechaza password de más de 100 caracteres", () => {
      const long = `A1!${"a".repeat(100)}`;
      const issue = findIssue(
        { ...baseValidInput, password: long, confirmPassword: long },
        "password",
      );
      expect(issue?.message).toBe("Máximo 100 caracteres");
    });
  });

  describe("validación de confirmPassword", () => {
    it("rechaza confirmPassword vacía", () => {
      const issue = findIssue(
        { ...baseValidInput, confirmPassword: "" },
        "confirmPassword",
      );
      expect(issue?.message).toBe("Confirmá la contraseña");
    });

    it("rechaza cuando las passwords no coinciden", () => {
      const issue = findIssue(
        { ...baseValidInput, confirmPassword: "Otra1!" },
        "confirmPassword",
      );
      expect(issue?.message).toBe("Las contraseñas no coinciden");
    });
  });
});
