import { isPasswordValid } from './password';

describe('isPasswordStrong', () => {
  it('should return false for a blank password', () => {
    expect(isPasswordValid('')).toBe(false);
  });

  it('should return false for any password less than 8 characters', () => {
    expect(isPasswordValid('1')).toBe(false);
    expect(isPasswordValid('1234567')).toBe(false);
    expect(isPasswordValid('aA1!aaa')).toBe(false);
  });

  it('requires 1 lowercase letter', () => {
    expect(isPasswordValid('AA1!AAAA')).toBe(false);
    expect(isPasswordValid('aA1!AAAA')).toBe(true);
  });

  it('requires 1 uppercase letter', () => {
    expect(isPasswordValid('aa1!aaaa')).toBe(false);
    expect(isPasswordValid('aA1!aaaa')).toBe(true);
  });

  it('requires 1 number', () => {
    expect(isPasswordValid('aAa!aaaa')).toBe(false);
    expect(isPasswordValid('aA1!aaaa')).toBe(true);
  });

  it('returns true for any password with more than 2 identical characters in a row', () => {
    // lll at end of string
    expect(isPasswordValid('aA1!bbccddeeffgghhiijjkklll')).toBe(true);
  });

  it('returns true when all restrictions met and length is greater than 19 characters', () => {
    expect(isPasswordValid('aA1!bbccddeeffg12345')).toBe(true);
  });

  it('returns true when all restrictions met and length is greater than 15 characters', () => {
    expect(isPasswordValid('aA1!bbccddeeffg')).toBe(true);
    expect(isPasswordValid('aA1!bbccddeeffgg')).toBe(true);
  });
});
