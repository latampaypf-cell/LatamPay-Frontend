import { act, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WalletProvider, useWallet } from "../../context/WalletContext";
import type {
  ApiWallet,
  ApiHistory,
  ApiExchangeRate,
  TransferResult,
} from "../../types/wallet/wallet.types";

const mocks = vi.hoisted(() => ({
  apiGetWallet: vi.fn(),
  apiGetHistory: vi.fn(),
  apiGetRates: vi.fn(),
  apiTransfer: vi.fn(),
  apiSwap: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock("../../services/wallet.api", () => ({
  apiGetWallet: mocks.apiGetWallet,
  apiGetHistory: mocks.apiGetHistory,
  apiGetRates: mocks.apiGetRates,
  apiTransfer: mocks.apiTransfer,
  apiSwap: mocks.apiSwap,
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

const fakeWallet: ApiWallet = {
  id: "w-1",
  cbu: "0000000000000000000001",
  alias: "demo.wallet",
  balances: [
    { currency_code: "ARS", amount: 1000 },
    { currency_code: "COP", amount: 500 },
    { currency_code: "VES", amount: 50 },
  ],
};

const emptyHistory: ApiHistory = {
  transactions: [],
  pagination: { totalItems: 0, totalPages: 0, currentPage: 1, limit: 50 },
};

const rates: ApiExchangeRate[] = [
  {
    from_currency: "ARS",
    to_currency: "COP",
    rate: 4,
    updated_at: "2026-06-17T00:00:00.000Z",
  },
];

let captured: ReturnType<typeof useWallet> | null = null;

const Probe = () => {
  captured = useWallet();
  return null;
};

const setup = async () => {
  captured = null;
  render(
    <WalletProvider>
      <Probe />
    </WalletProvider>,
  );
  await waitFor(() => {
    expect(captured).not.toBeNull();
    expect(captured!.isLoading).toBe(false);
    expect(captured!.balances.ARS).toBe(1000);
  });
};

beforeEach(() => {
  mocks.apiGetWallet.mockReset().mockResolvedValue(fakeWallet);
  mocks.apiGetHistory.mockReset().mockResolvedValue(emptyHistory);
  mocks.apiGetRates.mockReset().mockResolvedValue(rates);
  mocks.apiTransfer.mockReset();
  mocks.apiSwap.mockReset();
  mocks.useAuth.mockReset().mockReturnValue({ isAuthenticated: true });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("WalletContext.transfer — validaciones", () => {
  it("rechaza monto <= 0", async () => {
    await setup();
    let result!: Awaited<ReturnType<typeof captured.transfer>>;
    await act(async () => {
      result = await captured!.transfer({
        amount: 0,
        destination: "demo.dest",
        currency: "ARS",
      });
    });

    expect(result).toEqual({ ok: false, error: "Ingresá un monto válido." });
    expect(mocks.apiTransfer).not.toHaveBeenCalled();
  });

  it("rechaza monto no numérico", async () => {
    await setup();
    let result!: Awaited<ReturnType<typeof captured.transfer>>;
    await act(async () => {
      result = await captured!.transfer({
        amount: Number.NaN,
        destination: "demo.dest",
        currency: "ARS",
      });
    });

    expect(result.ok).toBe(false);
    expect(mocks.apiTransfer).not.toHaveBeenCalled();
  });

  it("rechaza moneda no soportada", async () => {
    await setup();
    let result!: Awaited<ReturnType<typeof captured.transfer>>;
    await act(async () => {
      result = await captured!.transfer({
        amount: 10,
        destination: "demo.dest",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currency: "USD" as any,
      });
    });

    expect(result).toEqual({ ok: false, error: "Moneda no soportada." });
    expect(mocks.apiTransfer).not.toHaveBeenCalled();
  });

  it("rechaza si el monto supera el saldo disponible", async () => {
    await setup();
    let result!: Awaited<ReturnType<typeof captured.transfer>>;
    await act(async () => {
      result = await captured!.transfer({
        amount: 5000,
        destination: "demo.dest",
        currency: "ARS",
      });
    });

    expect(result).toEqual({
      ok: false,
      error: "Saldo insuficiente en ARS.",
    });
    expect(mocks.apiTransfer).not.toHaveBeenCalled();
  });
});

describe("WalletContext.transfer — éxito", () => {
  it("llama apiTransfer con el payload normalizado y refresca el estado", async () => {
    await setup();
    const fakeResult: TransferResult = {
      transactionId: "tx-1",
      to: "demo.dest",
      amount: 100,
    };
    mocks.apiTransfer.mockResolvedValueOnce(fakeResult);
    mocks.apiGetWallet.mockResolvedValueOnce({
      ...fakeWallet,
      balances: [
        { currency_code: "ARS", amount: 900 },
        { currency_code: "COP", amount: 500 },
        { currency_code: "VES", amount: 50 },
      ],
    });

    let result!: Awaited<ReturnType<typeof captured.transfer>>;
    await act(async () => {
      result = await captured!.transfer({
        amount: 100,
        destination: "  demo.dest  ",
        currency: "ARS",
        description: "  pago  ",
      });
    });

    expect(result).toEqual({ ok: true });
    expect(mocks.apiTransfer).toHaveBeenCalledTimes(1);
    expect(mocks.apiTransfer).toHaveBeenCalledWith({
      to_identifier: "demo.dest",
      amount: 100,
      currency_code: "ARS",
      description: "pago",
    });
    // refresh dispara los 3 calls otra vez
    expect(mocks.apiGetWallet).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(captured!.balances.ARS).toBe(900);
    });
  });

  it("envía description=undefined cuando el campo viene vacío", async () => {
    await setup();
    mocks.apiTransfer.mockResolvedValueOnce({
      transactionId: "tx-2",
      to: "demo.dest",
      amount: 10,
    });

    await act(async () => {
      await captured!.transfer({
        amount: 10,
        destination: "demo.dest",
        currency: "ARS",
        description: "   ",
      });
    });

    expect(mocks.apiTransfer).toHaveBeenCalledWith(
      expect.objectContaining({ description: undefined }),
    );
  });
});

describe("WalletContext.transfer — errores de API", () => {
  it("traduce un Error del API en { ok:false, error }", async () => {
    await setup();
    mocks.apiTransfer.mockRejectedValueOnce(new Error("Destino inválido"));

    let result!: Awaited<ReturnType<typeof captured.transfer>>;
    await act(async () => {
      result = await captured!.transfer({
        amount: 10,
        destination: "demo.dest",
        currency: "ARS",
      });
    });

    expect(result).toEqual({ ok: false, error: "Destino inválido" });
    // No debería refrescar si el API falló
    expect(mocks.apiGetWallet).toHaveBeenCalledTimes(1);
  });

  it("usa mensaje genérico si el rechazo no es un Error estándar", async () => {
    await setup();
    mocks.apiTransfer.mockRejectedValueOnce("boom");

    let result!: Awaited<ReturnType<typeof captured.transfer>>;
    await act(async () => {
      result = await captured!.transfer({
        amount: 10,
        destination: "demo.dest",
        currency: "ARS",
      });
    });

    expect(result).toEqual({
      ok: false,
      error: "No pudimos completar la transferencia.",
    });
  });
});
