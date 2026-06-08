import { Card } from "../ui/Card";

export type CurrencyCardProps = {
  currency: string;
  value: string;
  valueClassName?: string;
};

export const CurrencyCard = ({
  currency,
  value,
  valueClassName = "text-cyan-400",
}: CurrencyCardProps) => (
  <Card padding="md">
    <p className="text-slate-400">{currency}</p>
    <p className={`mt-2 text-3xl font-bold ${valueClassName}`}>{value}</p>
  </Card>
);

export default CurrencyCard;
