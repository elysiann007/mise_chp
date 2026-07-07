export function calculateLineKdv(
  unitPrice: number,
  quantity: number,
  kdzRate: number,
): number {
  return round2(unitPrice * quantity * kdzRate);
}

export function calculateLineOtv(
  unitPrice: number,
  quantity: number,
  otvRate: number,
): number {
  return round2(unitPrice * quantity * otvRate);
}

export function calculateLineTotal(
  unitPrice: number,
  quantity: number,
  kdzRate: number,
  otvRate: number,
): number {
  const base = unitPrice * quantity;
  return round2(base + base * kdzRate + base * otvRate);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
