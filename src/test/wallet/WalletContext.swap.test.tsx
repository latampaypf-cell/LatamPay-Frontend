import { act, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WalletProvider, useWallet } from "../../context/WalletContext";
import type {
  ApiWallet,
  ApiHistory,
  ApiExchangeRate,
  SwapResult,
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

const swapResult: SwapResult = {
  id: "sw-1",
  type: "swap",
  status: "completed",
  from_currency: "ARS",
  to_currency: "COP",
  from_amount: "100",
  to_amount: "400",
  fee: "0",
  exchange_rate: "4",
  description: "swap demo",
  created_at: "2026-06-17T00:00:00.000Z",
  from_name: "Demo",
  from_alias: "demo.wallet",
  from_cbu: "0000000000000000000001",
  from_wallet_id: "w-1",
  to_name: "Demo",
  to_alias: "demo.wallet",
  to_cbu: "0000000000000000000001",
  to_wallet_id: "w-1",
};

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

describe("WalletContext.swap — validaciones", () => {
  it("rechaza monto <= 0", async () => {
    await setup();
    let result!: Awaited<ReturnType<typeof captured.swap>>;
    await act(async () => {
      result = await captured!.swap({ from: "ARS", to: "COP", amount: 0 });
    });

    expect(result).toEqual({ ok: false, error: "Ingresá un monto válido." });
    expect(mocks.apiSwap).not.toHaveBeenCalled();
  });

  it("rechaza misma moneda en from y to", async () => {
    await setup();
    let result!: Awaited<ReturnType<typeof captured.swap>>;
    await act(async () => {
      result = await captured!.swap({ from: "ARS", to: "ARS", amount: 10 });
    });

    expect(result).toEqual({
      ok: false,
      error: "Elegí monedas distintas para convertir.",
    });
    expect(mocks.apiSwap).not.toHaveBeenCalled();
  });

  it("rechaza moneda no soportada", async () => {
    await setup();
    let result!: Awaited<ReturnType<typeof captured.swap>>;
    await act(async () => {
      result = await captured!.swap({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        from: "USD" as any,
        to: "ARS",
        amount: 10,
      });
    });

    expect(result).toEqual({ ok: false, error: "Moneda no soportada." });
    expect(mocks.apiSwap).not.toHaveBeenCalled();
  });

  it("rechaza si el monto excede el saldo de origen", async () => {
    await setup();
    let result!: Awaited<ReturnType<typeof captured.swap>>;
    await act(async () => {
      result = await captured!.swap({
        from: "ARS",
        to: "COP",
        amount: 5000,
      });
    });

    expect(result).toEqual({
      ok: false,
      error: "Saldo insuficiente en ARS.",
    });
    expect(mocks.apiSwap).not.toHaveBeenCalled();
  });
});

describe("WalletContext.swap — éxito", () => {
  it("llama apiSwap con el payload correcto y devuelve toAmount + rate", async () => {
    await setup();
    mocks.apiSwap.mockResolvedValueOnce(swapResult);
    mocks.apiGetWallet.mockResolvedValueOnce({
      ...fakeWallet,
      balances: [
        { currency_code: "ARS", amount: 900 },
        { currency_code: "COP", amount: 900 },
        { currency_code: "VES", amount: 50 },
      ],
    });

    let result!: Awaited<ReturnType<typeof captured.swap>>;
    await act(async () => {
      result = await captured!.swap({
        from: "ARS",
        to: "COP",
        amount: 100,
      });
    });

    expect(result).toEqual({ ok: true, toAmount: 400, rate: 4 });
    expect(mocks.apiSwap).toHaveBeenCalledTimes(1);
    expect(mocks.apiSwap).toHaveBeenCalledWith({
      from_currency: "ARS",
      to_currency: "COP",
      amount: 100,
    });
    // refresh se dispara después del swap
    expect(mocks.apiGetWallet).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(captured!.balances.ARS).toBe(900);
      expect(captured!.balances.COP).toBe(900);
    });
  });
});

describe("WalletContext.swap — errores de API", () => {
  it("traduce un Error del API en { ok:false, error }", async () => {
    await setup();
    mocks.apiSwap.mockRejectedValueOnce(new Error("Tasa no disponible"));

    let result!: Awaited<ReturnType<typeof captured.swap>>;
    await act(async () => {
      result = await captured!.swap({
        from: "ARS",
        to: "COP",
        amount: 100,
      });
    });

    expect(result).toEqual({ ok: false, error: "Tasa no disponible" });
    expect(mocks.apiGetWallet).toHaveBeenCalledTimes(1); // no refresh
  });

  it("usa mensaje genérico si el rechazo no es un Error estándar", async () => {
    await setup();
    mocks.apiSwap.mockRejectedValueOnce("boom");

    let result!: Awaited<ReturnType<typeof captured.swap>>;
    await act(async () => {
      result = await captured!.swap({
        from: "ARS",
        to: "COP",
        amount: 100,
      });
    });

    expect(result).toEqual({
      ok: false,
      error: "No pudimos completar la conversión.",
    });
  });
});
