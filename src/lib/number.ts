import Decimal from 'decimal.js';
import millify from 'millify';

/**
 * Format a number to a string with commas and max 2 decimal places
 * @param num number to format
 */
export function formatCryptoAmount(num: string): string {
  const numAsDecimal = new Decimal(num).toDecimalPlaces(2);

  if (numAsDecimal.abs().greaterThanOrEqualTo(1000000)) {
    return millify(numAsDecimal.toNumber(), { precision: 2 });
  }

  return numAsDecimal
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    .replace(/\.0+$/, ''); // remove trailing zeros
}
