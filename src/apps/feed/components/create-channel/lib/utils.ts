import { ethers } from 'ethers';
import millify from 'millify';

export function parsePrice(priceWei?: any): string | undefined {
  if (!priceWei) {
    return undefined;
  }
  let number: number;
  try {
    if (typeof priceWei === 'object' && priceWei._isBigNumber) {
      number = Number(ethers.utils.formatEther(priceWei));
    } else if (typeof priceWei === 'string' && /^\d+$/.test(priceWei)) {
      number = Number(ethers.utils.formatEther(priceWei));
    } else {
      // Already formatted, just parse
      number = Number(priceWei);
    }
  } catch {
    return priceWei.toString();
  }
  if (number < 0.01) {
    return '< 0.01';
  } else if (number < 999999) {
    return number.toLocaleString();
  } else {
    return millify(number);
  }
}
