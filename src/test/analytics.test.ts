import { describe, expect, it } from "vitest";
import {
  getDistributionByKind,
  getMonthlySummary,
  getYearlyByMonth,
} from "../utils/analytics";
import type {
  Transaction,
  TransactionKind,
} from "../types/wallet/wallet.types";

type Overrides = Partial<Transaction> & { kind: TransactionKind };

const makeTx = (overrides: Overrides): Transaction => ({
  id: overrides.id ?? `tx-${Math.random().toString(36).slice(2)}`,
  title: overrides.title ?? "Tx",
  amount: overrides.amount ?? 0,
  kind: overrides.kind,
  createdAt: overrides.createdAt ?? "2026-06-10T12:00:00.000Z",
  status: overrides.status ?? "completed",
  // Respeta `currency: undefined` explícito en lugar de aplicar el fallback con ??
  currency: "currency" in overrides ? overrides.currency : "ARS",
  direction: overrides.direction ?? "sent",
  description: overrides.description,
  counterpartyName: overrides.counterpartyName,
  counterpartyCbu: overrides.counterpartyCbu,
  reason: overrides.reason,
});

describe("getMonthlySummary", () => {
  it("suma correctamente gastos (transfer_sent + withdraw) e ingresos (transfer_received + deposit)", () => {
    const txs: Transaction[] = [
      makeTx({
        kind: "transfer_sent",
        amount: -1000,
        createdAt: "2026-06-05T10:00:00.000Z",
      }),
      makeTx({
        kind: "withdraw",
        amount: -500,
        createdAt: "2026-06-15T10:00:00.000Z",
      }),
      makeTx({
        kind: "transfer_received",
        amount: 700,
        createdAt: "2026-06-10T10:00:00.000Z",
        direction: "received",
      }),
      makeTx({
        kind: "deposit",
        amount: 300,
        createdAt: "2026-06-20T10:00:00.000Z",
        direction: "received",
      }),
    ];

    const summary = getMonthlySummary(txs, "ARS", 2026, 5);

    expect(summary.totalSpent).toBe(1500);
    expect(summary.totalReceived).toBe(1000);
    expect(summary.totalSwapped).toBe(0);
    expect(summary.count).toBe(4);
  });

  it("no cuenta los swaps como gasto ni como ingreso (van a totalSwapped)", () => {
    const txs: Transaction[] = [
      makeTx({
        kind: "swap",
        amount: -2000,
        createdAt: "2026-06-12T10:00:00.000Z",
      }),
      makeTx({
        kind: "transfer_sent",
        amount: -100,
        createdAt: "2026-06-12T10:00:00.000Z",
      }),
    ];

    const summary = getMonthlySummary(txs, "ARS", 2026, 5);

    expect(summary.totalSpent).toBe(100);
    expect(summary.totalReceived).toBe(0);
    expect(summary.totalSwapped).toBe(2000);
    expect(summary.count).toBe(2);
  });

  it("no mezcla monedas: una transacción en ARS no aporta al sumario de COP", () => {
    const txs: Transaction[] = [
      makeTx({
        kind: "transfer_sent",
        amount: -5000,
        currency: "ARS",
        createdAt: "2026-06-10T10:00:00.000Z",
      }),
      makeTx({
        kind: "transfer_sent",
        amount: -200,
        currency: "COP",
        createdAt: "2026-06-10T10:00:00.000Z",
      }),
    ];

    const arsSummary = getMonthlySummary(txs, "ARS", 2026, 5);
    const copSummary = getMonthlySummary(txs, "COP", 2026, 5);

    expect(arsSummary.totalSpent).toBe(5000);
    expect(copSummary.totalSpent).toBe(200);
    expect(arsSummary.count).toBe(1);
    expect(copSummary.count).toBe(1);
  });

  it("excluye transacciones con status distinto de 'completed' (pending / failed)", () => {
    const txs: Transaction[] = [
      makeTx({
        kind: "transfer_sent",
        amount: -1000,
        status: "completed",
        createdAt: "2026-06-10T10:00:00.000Z",
      }),
      makeTx({
        kind: "transfer_sent",
        amount: -999,
        status: "pending",
        createdAt: "2026-06-10T10:00:00.000Z",
      }),
      makeTx({
        kind: "transfer_sent",
        amount: -888,
        status: "failed",
        createdAt: "2026-06-10T10:00:00.000Z",
      }),
    ];

    const summary = getMonthlySummary(txs, "ARS", 2026, 5);

    expect(summary.totalSpent).toBe(1000);
    expect(summary.count).toBe(1);
  });

  it("un mes sin transacciones devuelve totales en 0", () => {
    const txs: Transaction[] = [
      makeTx({
        kind: "transfer_sent",
        amount: -1000,
        createdAt: "2026-06-10T10:00:00.000Z",
      }),
    ];

    const summary = getMonthlySummary(txs, "ARS", 2026, 0); // Enero

    expect(summary.totalSpent).toBe(0);
    expect(summary.totalReceived).toBe(0);
    expect(summary.totalSwapped).toBe(0);
    expect(summary.count).toBe(0);
  });

  it("excluye transacciones sin currency definida", () => {
    const txs: Transaction[] = [
      makeTx({
        kind: "transfer_sent",
        amount: -1234,
        currency: undefined,
        createdAt: "2026-06-10T10:00:00.000Z",
      }),
    ];

    const summary = getMonthlySummary(txs, "ARS", 2026, 5);

    expect(summary.totalSpent).toBe(0);
    expect(summary.count).toBe(0);
  });
});

describe("getYearlyByMonth", () => {
  it("siempre devuelve 12 elementos aunque haya meses vacíos", () => {
    const txs: Transaction[] = [
      makeTx({
        kind: "transfer_sent",
        amount: -100,
        createdAt: "2026-03-15T10:00:00.000Z",
      }),
    ];

    const yearly = getYearlyByMonth(txs, "ARS", 2026);

    expect(yearly).toHaveLength(12);
    expect(yearly[0]).toMatchObject({ month: 0, monthLabel: "Ene", spent: 0, received: 0 });
    expect(yearly[2]).toMatchObject({ month: 2, monthLabel: "Mar", spent: 100, received: 0 });
    expect(yearly[11]).toMatchObject({ month: 11, monthLabel: "Dic", spent: 0, received: 0 });
  });

  it("acumula gastos e ingresos por mes correctamente", () => {
    const txs: Transaction[] = [
      makeTx({
        kind: "transfer_sent",
        amount: -300,
        createdAt: "2026-01-10T10:00:00.000Z",
      }),
      makeTx({
        kind: "withdraw",
        amount: -200,
        createdAt: "2026-01-20T10:00:00.000Z",
      }),
      makeTx({
        kind: "deposit",
        amount: 700,
        createdAt: "2026-01-25T10:00:00.000Z",
        direction: "received",
      }),
      makeTx({
        kind: "transfer_received",
        amount: 50,
        createdAt: "2026-07-01T10:00:00.000Z",
        direction: "received",
      }),
    ];

    const yearly = getYearlyByMonth(txs, "ARS", 2026);

    expect(yearly[0]?.spent).toBe(500);
    expect(yearly[0]?.received).toBe(700);
    expect(yearly[6]?.received).toBe(50);
    expect(yearly[6]?.spent).toBe(0);
  });
});

describe("getDistributionByKind", () => {
  it("incluye conversiones como porción propia de la distribución", () => {
    const txs: Transaction[] = [
      makeTx({
        kind: "transfer_sent",
        amount: -100,
        createdAt: "2026-06-10T10:00:00.000Z",
      }),
      makeTx({
        kind: "swap",
        amount: -500,
        createdAt: "2026-06-12T10:00:00.000Z",
      }),
      makeTx({
        kind: "swap",
        amount: -250,
        createdAt: "2026-06-15T10:00:00.000Z",
      }),
    ];

    const dist = getDistributionByKind(txs, "ARS", 2026, 5);

    const swap = dist.find((d) => d.kind === "swap");
    const sent = dist.find((d) => d.kind === "transfer_sent");

    expect(swap).toBeDefined();
    expect(swap?.total).toBe(750);
    expect(swap?.count).toBe(2);
    expect(swap?.label).toBe("Conversiones");
    expect(sent?.total).toBe(100);
  });

  it("devuelve array vacío si no hay movimientos para el mes elegido", () => {
    const txs: Transaction[] = [
      makeTx({
        kind: "transfer_sent",
        amount: -100,
        createdAt: "2026-06-10T10:00:00.000Z",
      }),
    ];

    const dist = getDistributionByKind(txs, "ARS", 2026, 0); // Enero

    expect(dist).toEqual([]);
  });
});
