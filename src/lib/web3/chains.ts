import { Chains } from './index';

export function getChainNameFromId(chainId: string): string {
  for (const [
    key,
    value,
  ] of Object.entries(Chains)) {
    if (chainId === key) {
      return value.toString();
    }
  }

  return 'Local';
}
