import { Card } from "../ui/Card";

export type TransactionRowProps = {
  title: string;
  amount: string;
  amountClassName?: string;
};

export const TransactionRow = ({
  title,
  amount,
  amountClassName = "text-cyan-400",
}: TransactionRowProps) => (
  <Card padding="sm" className="flex items-center justify-between px-5 py-5">
    <span>{title}</span>
    <span className={`font-semibold ${amountClassName}`}>{amount}</span>
  </Card>
);

export default TransactionRow;
