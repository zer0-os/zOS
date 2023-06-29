import Decimal from 'decimal.js';
import millify from 'millify';

export function formatNumber(num: string): string {
  const numAsDecimal = new Decimal(num).toDecimalPlaces(2);

  if (numAsDecimal.abs().greaterThanOrEqualTo(1000000)) {
    return millify(numAsDecimal.toNumber(), { precision: 2 });
  }

  return numAsDecimal
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    .replace(/\.0+$/, ''); // remove trailing zeros
}
