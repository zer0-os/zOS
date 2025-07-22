export const formatDollars = (number: number) => {
  if (number === 0) {
    return '0.00';
  }

  if (number < 0.01) {
    return '<0.01';
  }

  return `$${Number(number.toFixed(2)).toLocaleString()}`;
};

/**
 * Parse a localized number to a string.
 * @param {string} stringNumber - the localized number
 * @param {string} locale - [optional] the locale that the number is represented in. Omit this parameter to use the current locale.
 */
export function parseLocaleNumber(stringNumber: string, locale?: string): string {
  const thousandSeparator = Intl.NumberFormat(locale)
    .format(11111)
    .replace(/\p{Number}/gu, '');
  const decimalSeparator = Intl.NumberFormat(locale)
    .format(1.1)
    .replace(/\p{Number}/gu, '');

  return stringNumber
    .replace(new RegExp('\\' + thousandSeparator, 'g'), '')
    .replace(new RegExp('\\' + decimalSeparator), '.');
}
