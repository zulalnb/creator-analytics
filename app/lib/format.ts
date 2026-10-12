const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatPercent(value: number): string {
  return `${formatNumber(value)}%`;
}

export function formatMinutes(value: number): string {
  return `${formatNumber(value)} min`;
}

export function formatSigned(value: number, unit = ""): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatNumber(Math.abs(value))}${unit}`;
}

export const MISSING_VALUE = "—";

export function formatOrMissing(
  value: number | null,
  format: (value: number) => string,
): string {
  return value === null ? MISSING_VALUE : format(value);
}
