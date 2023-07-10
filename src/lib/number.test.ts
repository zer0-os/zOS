import { formatWeiAmount } from './number';
import { parseEther } from 'ethers/lib/utils'; // replace with your actual file name

const get = (num: string) => parseEther(num).toString();

describe('formatWeiAmount', () => {
  it('should commify numbers less than 1 million', () => {
    expect(formatWeiAmount(get('12345'))).toEqual('12,345');
  });

  it('should round numbers less than 1 million to 2 DP of precision', () => {
    expect(formatWeiAmount(get('12345.694206942'))).toEqual('12,345.69');
    expect(formatWeiAmount(get('12345.6'))).toEqual('12,345.6');
  });

  it('should format numbers greater than or equal to 100,000 with suffix K', () => {
    expect(formatWeiAmount(get('123456'))).toEqual('123.46K');
  });

  it('should format numbers greater than or equal to 1 million with suffix M', () => {
    expect(formatWeiAmount(get('12345678'))).toEqual('12.35M');
  });

  it('should format numbers greater than or equal to 1 billion with suffix B', () => {
    expect(formatWeiAmount(get('12345678000'))).toEqual('12.35B');
  });

  it('should format numbers greater than or equal to 1 trillion with suffix T', () => {
    expect(formatWeiAmount(get('12345678000000'))).toEqual('12.35T');
  });

  it('should handle negative numbers', () => {
    expect(formatWeiAmount(get('-12345'))).toEqual('-12,345');
    expect(formatWeiAmount(get('-12345678'))).toEqual('-12.35M');
  });
});
