import { useCallback, useEffect, useRef, useState } from "react";
import { apiGetHistory } from "../services/wallet.api";
import { mapTransaction } from "../utils/transaction.mapper";
import type { Transaction } from "../types/wallet/wallet.types";

const PAGE_SIZE = 50;
const MAX_PAGES = 40;

export type UseAllTransactionsState = {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useAllTransactions = (): UseAllTransactionsState => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const collected: Transaction[] = [];
      let page = 1;

      while (page <= MAX_PAGES) {
        const res = await apiGetHistory(page, PAGE_SIZE);
        const rows = res.transactions ?? [];

        if (rows.length === 0) break;

        collected.push(...rows.map(mapTransaction));

        const totalPages = Number(res.pagination?.totalPages ?? 0);
        if (!Number.isFinite(totalPages) || totalPages <= 0) {
          if (rows.length < PAGE_SIZE) break;
        } else if (page >= totalPages) {
          break;
        }

        page += 1;
      }

      if (mounted.current) {
        setTransactions(collected);
        setIsLoading(false);
      }
    } catch (e) {
      if (!mounted.current) return;
      const message =
        e instanceof Error
          ? e.message
          : "No pudimos cargar el historial completo.";
      setError(message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void fetchAll();
    return () => {
      mounted.current = false;
    };
  }, [fetchAll]);

  return { transactions, isLoading, error, refetch: fetchAll };
};

export default useAllTransactions;
