import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import { MissingValue } from "~/components/overview/missing-value";
import { formatNumber } from "~/lib/format";
import { cn } from "~/lib/utils";

interface MetricChangeProps {
  value: number | null;
  unit: string;
}

export function MetricChange({ value, unit }: MetricChangeProps) {
  if (value === null) return <MissingValue />;

  const direction = Math.abs(value) < 1e-9 ? "zero" : value > 0 ? "up" : "down";
  const Icon = direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : Minus;
  const sign = direction === "up" ? "+" : direction === "down" ? "-" : "";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-end gap-1 font-medium tabular-nums",
        direction === "up" && "text-emerald-700 dark:text-emerald-400",
        direction === "down" && "text-red-700 dark:text-red-400",
        direction === "zero" && "text-muted-foreground",
      )}
    >
      <Icon aria-hidden="true" className="size-3" />
      {sign}
      {formatNumber(Math.abs(value))} {unit}
    </span>
  );
}
