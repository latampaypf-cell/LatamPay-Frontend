import { describe, expect, it } from "vitest";
import { loginSchema } from "../../schemas/login.schema";

const validInput = {
  email: "test@example.com",
  password: "Password123!",
};

const parseError = (input: unknown) => {
  const result = loginSchema.safeParse(input);
  if (result.success) throw new Error("Se esperaba que el parse fallara.");
  return result.error.issues;
};

const findIssue = (input: unknown, path: string) =>
  parseError(input).find((i) => i.path[0] === path);

describe("loginSchema", () => {
  describe("casos válidos", () => {
    it("acepta un email y password correctos", () => {
      const result = loginSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it("hace trim a los espacios alrededor del email", () => {
      const result = loginSchema.safeParse({
        email: "  user@example.com  ",
        password: "anything",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@example.com");
      }
    });

    it("acepta password de 1 carácter (mínimo)", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "x",
      });
      expect(result.success).toBe(true);
    });

    it("acepta password de 72 caracteres (máximo)", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "a".repeat(72),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("validación de email", () => {
    it("rechaza email sin @", () => {
      const issue = findIssue(
        { email: "noemail", password: "anything" },
        "email",
      );
      expect(issue?.message).toBe("Ingresá un email válido.");
    });

    it("rechaza email sin dominio", () => {
      const issue = findIssue(
        { email: "user@", password: "anything" },
        "email",
      );
      expect(issue?.message).toBe("Ingresá un email válido.");
    });

    it("rechaza email sin TLD", () => {
      const issue = findIssue(
        { email: "user@domain", password: "anything" },
        "email",
      );
      expect(issue?.message).toBe("Ingresá un email válido.");
    });

    it("rechaza email vacío", () => {
      const issue = findIssue({ email: "", password: "anything" }, "email");
      expect(issue?.message).toBe("Ingresá un email válido.");
    });

    it("rechaza email solo con espacios", () => {
      const issue = findIssue(
        { email: "   ", password: "anything" },
        "email",
      );
      expect(issue?.message).toBe("Ingresá un email válido.");
    });

    it("rechaza email que no sea string", () => {
      const result = loginSchema.safeParse({
        email: 123,
        password: "anything",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("validación de password", () => {
    it("rechaza password vacía", () => {
      const issue = findIssue(
        { email: "test@example.com", password: "" },
        "password",
      );
      expect(issue?.message).toBe("La contraseña es obligatoria.");
    });

    it("rechaza password de más de 72 caracteres", () => {
      const issue = findIssue(
        { email: "test@example.com", password: "a".repeat(73) },
        "password",
      );
      expect(issue?.message).toBe("La contraseña es demasiado larga.");
    });

    it("rechaza si el campo password falta", () => {
      const result = loginSchema.safeParse({ email: "test@example.com" });
      expect(result.success).toBe(false);
    });
  });

  describe("reporte de errores", () => {
    it("reporta ambos errores cuando email y password fallan", () => {
      const issues = parseError({ email: "noemail", password: "" });
      const paths = issues.map((i) => i.path[0]);
      expect(paths).toContain("email");
      expect(paths).toContain("password");
    });
  });
});
