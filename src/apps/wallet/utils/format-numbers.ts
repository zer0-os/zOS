/**
 * Get the thousand separator for the current locale.
 * 11,111 => ','
 */
export const thousandSeparator = Intl.NumberFormat()
  .format(11111)
  .replace(/\p{Number}/gu, '');

/**
 * Get the decimal separator for the current locale.
 * 1.1 => '.'
 */
export const decimalSeparator = Intl.NumberFormat()
  .format(1.1)
  .replace(/\p{Number}/gu, '');

/**
 * Format a number to a string with 2 decimal places.
 * @param number - The number to format.
 * @returns The formatted number. Example: 1.10 -> $1.10
 */
export const formatDollars = (number: number) => {
  if (number === 0) {
    return `0${decimalSeparator}00`;
  }

  if (number < 0.01) {
    return `<0${decimalSeparator}01`;
  }

  return `$${Number(number.toFixed(2)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Parse a localized number to a string.
 * @param stringNumber - the localized number
 * @returns The parsed number. Example: 1,111.11 | 1.111,11 -> 1111.11
 */
export function parseLocaleNumber(stringNumber: string): string {
  return stringNumber
    .replace(new RegExp('\\' + thousandSeparator, 'g'), '')
    .replace(new RegExp('\\' + decimalSeparator), '.');
}
