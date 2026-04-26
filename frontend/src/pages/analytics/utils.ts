export function formatCurrency(value: number) {
  return `EGP ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function formatCompactCurrency(value: number) {
  if (value >= 1000) {
    return `EGP ${(value / 1000).toFixed(1)}k`;
  }
  return `EGP ${Math.round(value)}`;
}

export function truncateLabel(label: string, maxLength = 12) {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, maxLength - 1)}...`;
}
