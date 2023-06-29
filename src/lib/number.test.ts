import { formatCryptoAmount } from './number'; // replace with your actual file name

describe('formatCryptoAmount', () => {
  it('should commify numbers less than 1 million', () => {
    expect(formatCryptoAmount('12345')).toEqual('12,345');
  });

  it('should round numbers less than 1 million to 2 DP of precision', () => {
    expect(formatCryptoAmount('12345.6942069420')).toEqual('12,345.69');
    expect(formatCryptoAmount('12345.6')).toEqual('12,345.6');
  });

  it('should format numbers greater than or equal to 1 million with suffix M', () => {
    expect(formatCryptoAmount('12345678')).toEqual('12.35M');
  });

  it('should format numbers greater than or equal to 1 billion with suffix B', () => {
    expect(formatCryptoAmount('12345678000')).toEqual('12.35B');
  });

  it('should format numbers greater than or equal to 1 trillion with suffix T', () => {
    expect(formatCryptoAmount('12345678000000')).toEqual('12.35T');
  });

  it('should handle negative numbers', () => {
    expect(formatCryptoAmount('-12345')).toEqual('-12,345');
    expect(formatCryptoAmount('-12345678')).toEqual('-12.35M');
  });
});
