import millify from 'millify';

/**
 * Format a number to a string with commas and max 2 decimal places
 * @param num number to format
 */
export function formatWeiAmount(num: string): string {
  const stringValue = num.padStart(19, '0');
  const whole = stringValue.slice(0, -18);
  const decimal = stringValue.slice(-18).slice(0, 4).replace(/0+$/, '');
  const decimalString = decimal.length > 0 ? `.${decimal}` : '';

  const asString = whole + decimalString;
  const asNum = Number(asString);

  if (asNum > 100000 || asNum <= -100000) {
    return millify(asNum, { precision: 2 });
  }

  return asNum.toLocaleString('en-US', { maximumFractionDigits: 2 });
}
