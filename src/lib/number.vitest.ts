import { calculateTotalPriceInUSDCents, formatUSD, formatWeiAmount } from './number';
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

describe('calculateTotalPriceInUSD', () => {
  const currentTokenPriceInUSD = 0.041035425;

  it('should calculate the total price correctly for small token amounts', () => {
    expect(calculateTotalPriceInUSDCents('360909800000000000000000', currentTokenPriceInUSD)).toEqual(1481009);
    expect(calculateTotalPriceInUSDCents('1000000000000000000', currentTokenPriceInUSD)).toEqual(4);
    expect(calculateTotalPriceInUSDCents('12345678900000000000', currentTokenPriceInUSD)).toEqual(51);
  });

  it('should calculate the total price correctly for large token amounts', () => {
    expect(calculateTotalPriceInUSDCents('98765432109876543210987654321', currentTokenPriceInUSD)).toEqual(
      405288148194
    );
  });

  it('should handle zero token amount', () => {
    expect(calculateTotalPriceInUSDCents('0', currentTokenPriceInUSD)).toEqual(0);
  });
});

describe('formatUSD', () => {
  it('should commify numbers less than 1 million', () => {
    expect(formatUSD(1234500)).toEqual('$12,345.00');
  });

  it('should format numbers greater than or equal to 100,000 with suffix K', () => {
    expect(formatUSD(9999999)).toEqual('$99,999.99');
    expect(formatUSD(10000000)).toEqual('$100K');
    expect(formatUSD(12345699)).toEqual('$123K');
  });

  it('should format numbers greater than or equal to 1 million with suffix M', () => {
    expect(formatUSD(99999999)).toEqual('$999K');
    expect(formatUSD(100000000)).toEqual('$1.00M');
    expect(formatUSD(123456990)).toEqual('$1.23M');
  });

  it('should format numbers greater than or equal to 1 billion with suffix B', () => {
    expect(formatUSD(99999999999)).toEqual('$999.99M');
    expect(formatUSD(100000000000)).toEqual('$1.00B');
    expect(formatUSD(123456990000)).toEqual('$1.23B');
  });

  it('should format numbers greater than or equal to 1 trillion with suffix T', () => {
    expect(formatUSD(99999999999999)).toEqual('$999.99B');
    expect(formatUSD(100000000000000)).toEqual('$1.00T');
    expect(formatUSD(123456990000000)).toEqual('$1.23T');
  });
});
