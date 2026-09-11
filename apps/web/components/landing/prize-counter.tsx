import { formatSoles } from "@/components/landing/content";

export type PrizeCounterFormat = "soles" | "number";

interface PrizeCounterProps {
  readonly amount: number;
  readonly format?: PrizeCounterFormat;
}

export function formatPrizeAmount(
  amount: number,
  format: PrizeCounterFormat,
): string {
  if (format === "number") {
    return amount.toLocaleString("es-PE");
  }

  return formatSoles(amount);
}

export function PrizeCounter({ amount, format = "soles" }: PrizeCounterProps) {
  return (
    <span className="tabular-nums">{formatPrizeAmount(amount, format)}</span>
  );
}
