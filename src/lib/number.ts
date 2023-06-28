import { millify } from 'millify';

export function formatNumber(num: number | string): string {
  let asNum;
  if (typeof num === 'string') {
    asNum = parseFloat(num);
  } else {
    asNum = num;
  }

  if (asNum >= 1000000) return millify(asNum, { precision: 2 });

  return asNum.toLocaleString('en-US', { maximumFractionDigits: 2 });
}
