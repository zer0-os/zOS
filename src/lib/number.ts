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
 * @returns The total price in USD in cents
 */
export function calculateTotalPriceInUSDCents(num: string, currentTokenPriceInUSD: number) {
  const [
    whole,
    decimalString,
  ] = getPartsFromNum(num);
  const asString = whole + decimalString;
  const asNum = Number(asString);

  const totalPriceInUSD = asNum * currentTokenPriceInUSD;

  return Math.round(totalPriceInUSD * 100);
}

export function formatUSD(cents: number) {
  const dollars = Math.floor(cents / 100);
  if (dollars >= 1000000000000) {
    const tensOfBillions = Math.floor(dollars / 10000000000);
    return `$${(tensOfBillions / 100).toFixed(2)}T`;
  } else if (dollars >= 1000000000) {
    const tensOfMillions = Math.floor(dollars / 10000000);
    return `$${(tensOfMillions / 100).toFixed(2)}B`;
  } else if (dollars >= 1000000) {
    const tensOfThousands = Math.floor(dollars / 10000);
    return `$${(tensOfThousands / 100).toFixed(2)}M`;
  } else if (dollars >= 100000) {
    return `$${Math.floor(dollars / 1000)}K`;
  }

  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}
