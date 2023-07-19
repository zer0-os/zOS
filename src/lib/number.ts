import millify from 'millify';

/**
 * Splits the given number string into its whole and decimal parts, accounting for the
 * fixed decimal precision of 18.
 *
 * @param num - The number string to split into parts.
 * @returns An array containing the whole part and decimal part of the number as separate strings.
 * For example, if the input number is "360909800000000000000000", the function will return
 * ["360", "9098"] representing the whole and decimal parts respectively.
 */
function getPartsFromNum(num: string): [string, string] {
  const stringValue = num.padStart(19, '0');
  const whole = stringValue.slice(0, -18);
  const decimal = stringValue.slice(-18).slice(0, 4).replace(/0+$/, '');
  const decimalString = decimal.length > 0 ? `.${decimal}` : '';
  return [
    whole,
    decimalString,
  ];
}

/**
 * Format a number to a string with commas and max 2 decimal places
 * @param num number to format
 */
export function formatWeiAmount(num: string): string {
  const [
    whole,
    decimalString,
  ] = getPartsFromNum(num);
  const asString = whole + decimalString;
  const asNum = Number(asString);

  if (asNum > 100000 || asNum <= -100000) {
    return millify(asNum, { precision: 2 });
  }

  return asNum.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/**
 * Calculates the total price in USD based on the given amount of tokens and the current token price in USD.
 *
 * @param num - The amount of tokens as a string with 18 decimal precision.
 * @param currentTokenPriceInUSD - The current token price in USD for 1 token.
 * @returns The total price in USD as a formatted string with thousand separators and decimal precision.
 * For example, if the input token amount is "360909800000000000000000" and the current token price is
 * 0.041035425, the function will return "$14,810.09 USD".
 */
export function calculateTotalPriceInUSD(num: string, currentTokenPriceInUSD: number): string {
  const [
    whole,
    decimalString,
  ] = getPartsFromNum(num);
  const asString = whole + decimalString;
  const asNum = Number(asString);
  const totalPriceInUSD = (asNum * currentTokenPriceInUSD).toLocaleString('en-US', {
    maximumFractionDigits: 2,
    useGrouping: true,
  });

  return `$${totalPriceInUSD} USD`;
}
