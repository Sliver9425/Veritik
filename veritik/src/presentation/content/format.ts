/** Formato de números para la UI en español (coma decimal), sin depender de Intl. */
export function decimal(value: number, digits = 2): string {
  return value.toFixed(digits).replace('.', ',');
}

export function percent(ratio: number, digits = 1): string {
  return `${decimal(ratio * 100, digits)} %`;
}

export function compactNumber(value: number): string {
  if (value >= 1_000_000) return `${decimal(value / 1_000_000, 1)} M`;
  if (value >= 1_000) return `${decimal(value / 1_000, 1)} mil`;
  return String(value);
}

/** "15/11" */
export function shortDate(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}`;
}
