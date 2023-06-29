import { formatNumber } from './number'; // replace with your actual file name

describe('formatNumber', () => {
  it('should commify numbers less than 1 million', () => {
    expect(formatNumber('12345')).toEqual('12,345');
  });

  it('should round numbers less than 1 million to 2 DP of precision', () => {
    expect(formatNumber('12345.6942069420')).toEqual('12,345.69');
    expect(formatNumber('12345.6')).toEqual('12,345.6');
  });

  it('should format numbers greater than or equal to 1 million with suffix M', () => {
    expect(formatNumber('12345678')).toEqual('12.35M');
  });

  it('should format numbers greater than or equal to 1 billion with suffix B', () => {
    expect(formatNumber('12345678000')).toEqual('12.35B');
  });

  it('should format numbers greater than or equal to 1 trillion with suffix T', () => {
    expect(formatNumber('12345678000000')).toEqual('12.35T');
  });

  it('should handle negative numbers', () => {
    expect(formatNumber('-12345')).toEqual('-12,345');
    expect(formatNumber('-12345678')).toEqual('-12.35M');
  });
});
