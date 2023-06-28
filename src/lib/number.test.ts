import { formatNumber } from './number'; // replace with your actual file name

describe('formatNumber', () => {
  it('should commify numbers less than 1 million', () => {
    expect(formatNumber(12345)).toEqual('12,345');
    expect(formatNumber('12345')).toEqual('12,345');
  });

  it('should format numbers less than 1 million with at most two decimal places', () => {
    expect(formatNumber(12345.694206942)).toEqual('12,345.69');
    expect(formatNumber('12345.6942069420')).toEqual('12,345.69');
    expect(formatNumber('12345.6')).toEqual('12,345.6');
  });

  it('should format numbers greater than or equal to 1 million with suffix', () => {
    expect(formatNumber(12345678)).toEqual('12.35M');
    expect(formatNumber('12345678')).toEqual('12.35M');
  });
});
