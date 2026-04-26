export function formatEgp(value: number) {
  if (!Number.isFinite(value)) return "EGP 0.00";
  const rounded = Math.round(value * 100) / 100;
  return `EGP ${rounded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatInt(value: number) {
  if (!Number.isFinite(value)) return "0";
  return Math.round(value).toLocaleString();
}
