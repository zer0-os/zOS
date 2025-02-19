import { parseWorldZid } from './zid';

describe('getWorldZid', () => {
  it('should return the world zid', () => {
    expect(parseWorldZid('foo')).toBe('foo');
    expect(parseWorldZid('foo.bar')).toBe('foo');
    expect(parseWorldZid('foo.bar.baz')).toBe('foo');
  });

  it('should handle undefined', () => {
    expect(parseWorldZid(undefined)).toBe(undefined);
  });

  it('should handle empty string', () => {
    expect(parseWorldZid('')).toBe(undefined);
  });

  it('should handle ZIDs with 0:// prefix', () => {
    expect(parseWorldZid('0://foo')).toBe('0://foo');
    expect(parseWorldZid('0://foo.bar')).toBe('0://foo');
    expect(parseWorldZid('0://foo.bar.baz')).toBe('0://foo');
  });
});
