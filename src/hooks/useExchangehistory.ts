import { useEffect, useState } from "react";
import { getExchangeHistory, type ExchangeHistoryItem } from "../services/exchangeApi";


export const useExchangeHistory = (
  from: string,
  to: string,
) => {
  const [history, setHistory] = useState<
    ExchangeHistoryItem[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
  const load = async () => {
    try {
      setLoading(true);

      setHistory([]);

      const data = await getExchangeHistory(
        from,
        to,
      );

      setHistory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  load();
}, [from, to]);
  return {
    history,
    loading,
  };
};