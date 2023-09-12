import { calculateTotalPriceInUSD, formatWeiAmount } from './number';
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
    expect(calculateTotalPriceInUSD('360909800000000000000000', currentTokenPriceInUSD)).toEqual('$14,810.09 USD');
    expect(calculateTotalPriceInUSD('1000000000000000000', currentTokenPriceInUSD)).toEqual('$0.04 USD');
    expect(calculateTotalPriceInUSD('12345678900000000000', currentTokenPriceInUSD)).toEqual('$0.51 USD');
  });

  it('should calculate the total price correctly for large token amounts', () => {
    expect(calculateTotalPriceInUSD('1000000000000000000000000', currentTokenPriceInUSD)).toEqual('$41,035.43 USD');
    expect(calculateTotalPriceInUSD('98765432109876543210987654321', currentTokenPriceInUSD)).toEqual(
      '$4,052,881,481.94 USD'
    );
    expect(calculateTotalPriceInUSD('1000000000000000000000000000000', currentTokenPriceInUSD)).toEqual(
      '$41,035,425,000 USD'
    );
  });

  it('should display USD value with comma separation', () => {
    expect(calculateTotalPriceInUSD('123456789000000000000000000', currentTokenPriceInUSD)).toEqual(
      '$5,066,101.81 USD'
    );
    expect(calculateTotalPriceInUSD('12345678900000000000000000', currentTokenPriceInUSD)).toEqual('$506,610.18 USD');
    expect(calculateTotalPriceInUSD('1234567890000000000000000', currentTokenPriceInUSD)).toEqual('$50,661.02 USD');
    expect(calculateTotalPriceInUSD('123456789000000000000000', currentTokenPriceInUSD)).toEqual('$5,066.1 USD');
    expect(calculateTotalPriceInUSD('12345678900000000000000', currentTokenPriceInUSD)).toEqual('$506.61 USD');
  });

  it('should handle zero token amount', () => {
    expect(calculateTotalPriceInUSD('0', currentTokenPriceInUSD)).toEqual('$0 USD');
  });
});
