import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiLogin, apiMe, apiRegister } from "../../services/auth.api";

type MockResponseInit = {
  ok?: boolean;
  status?: number;
  body?: unknown;
  jsonThrows?: boolean;
};

const mockResponse = ({
  ok = true,
  status = 200,
  body = {},
  jsonThrows = false,
}: MockResponseInit): Response => {
  return {
    ok,
    status,
    json: async () => {
      if (jsonThrows) throw new Error("invalid json");
      return body;
    },
  } as unknown as Response;
};

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiLogin", () => {
  it("devuelve user + token cuando el backend responde 200", async () => {
    const data = {
      user: {
        id: "1",
        email: "user@example.com",
        role: "user",
        name: "User",
      },
      token: "jwt-token",
    };
    fetchMock.mockResolvedValueOnce(
      mockResponse({ body: { status: "success", data } }),
    );

    const result = await apiLogin("user@example.com", "Password1!");

    expect(result).toEqual(data);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/auth/login");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      email: "user@example.com",
      password: "Password1!",
    });
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
  });

  it("propaga el mensaje del backend cuando responde error", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({
        ok: false,
        status: 401,
        body: { status: "error", message: "Credenciales inválidas" },
      }),
    );

    await expect(
      apiLogin("user@example.com", "wrong"),
    ).rejects.toThrowError("Credenciales inválidas");
  });

  it("usa el mensaje fallback si el error no trae message", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ ok: false, status: 500, body: {} }),
    );

    await expect(apiLogin("user@example.com", "pass")).rejects.toThrowError(
      "No pudimos iniciar sesión.",
    );
  });

  it("usa el mensaje fallback cuando la respuesta no es JSON válido", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ ok: false, status: 500, jsonThrows: true }),
    );

    await expect(apiLogin("user@example.com", "pass")).rejects.toThrowError(
      "No pudimos iniciar sesión.",
    );
  });

  it("tira error si la respuesta 200 no trae data", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ body: { status: "success" } }),
    );

    await expect(apiLogin("user@example.com", "pass")).rejects.toThrowError(
      "Respuesta inválida del servidor.",
    );
  });
});

describe("apiRegister", () => {
  it("hace POST a /api/auth/register con los datos correctos", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ body: { status: "success", data: {} } }),
    );

    await apiRegister("Juan Perez", "juan@example.com", "Password1!");

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/auth/register");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      name: "Juan Perez",
      email: "juan@example.com",
      password: "Password1!",
    });
  });

  it("propaga el mensaje del backend ante un email duplicado (409)", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({
        ok: false,
        status: 409,
        body: {
          status: "error",
          message: "El correo electrónico ya está registrado.",
        },
      }),
    );

    await expect(
      apiRegister("Juan", "dup@example.com", "Password1!"),
    ).rejects.toThrowError("El correo electrónico ya está registrado.");
  });

  it("usa el mensaje fallback si el backend no responde nada", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ ok: false, status: 500, jsonThrows: true }),
    );

    await expect(
      apiRegister("Juan", "user@example.com", "Password1!"),
    ).rejects.toThrowError("No pudimos crear la cuenta.");
  });

  it("no tira error si el response es 200 sin data", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ body: { status: "success" } }),
    );

    await expect(
      apiRegister("Juan", "user@example.com", "Password1!"),
    ).resolves.toBeUndefined();
  });
});

describe("apiMe", () => {
  it("manda el header Authorization con Bearer token", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({
        body: {
          status: "success",
          user: { id: "1", email: "u@e.com", role: "user" },
        },
      }),
    );

    const user = await apiMe("jwt-token");

    expect(user).toEqual({ id: "1", email: "u@e.com", role: "user" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/auth/me");
    expect(init.headers).toEqual({ Authorization: "Bearer jwt-token" });
  });

  it("tira error con el mensaje del backend ante token inválido", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({
        ok: false,
        status: 401,
        body: { status: "error", message: "Token inválido" },
      }),
    );

    await expect(apiMe("bad-token")).rejects.toThrowError("Token inválido");
  });

  it("tira error si el response 200 no trae user", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ body: { status: "success" } }),
    );

    await expect(apiMe("jwt-token")).rejects.toThrowError(
      "Respuesta inválida del servidor.",
    );
  });
});
