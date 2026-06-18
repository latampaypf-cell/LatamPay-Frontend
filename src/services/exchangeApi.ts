export interface ExchangeHistoryItem {
  rate: string;
  created_at: string;
}

export const getExchangeHistory = async (
  from: string,
  to: string,
): Promise<ExchangeHistoryItem[]> => {
  const response = await fetch(
    `${
      import.meta.env.VITE_API_URL
    }/api/exchange/history?from=${from}&to=${to}`
  );

  if (!response.ok) {
    throw new Error("Error obteniendo historial");
  }

  const data = await response.json();

  return data.data;
};