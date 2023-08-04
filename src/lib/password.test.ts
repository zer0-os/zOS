import { isPasswordStrong } from './password';

describe('isPasswordStrong', () => {
  it('should return false for a blank password', () => {
    expect(isPasswordStrong('')).toBe(false);
  });

  it('should return false for any password less than 8 characters', () => {
    expect(isPasswordStrong('1')).toBe(false);
    expect(isPasswordStrong('1234567')).toBe(false);
    expect(isPasswordStrong('aA1!aaa')).toBe(false);
  });

  it('requires 1 lowercase letter', () => {
    expect(isPasswordStrong('AA1!AAAA')).toBe(false);
    expect(isPasswordStrong('aA1!AAAA')).toBe(true);
  });

  it('requires 1 uppercase letter', () => {
    expect(isPasswordStrong('aa1!aaaa')).toBe(false);
    expect(isPasswordStrong('aA1!aaaa')).toBe(true);
  });

  it('requires 1 number', () => {
    expect(isPasswordStrong('aAa!aaaa')).toBe(false);
    expect(isPasswordStrong('aA1!aaaa')).toBe(true);
  });

  it('returns true for any password with more than 2 identical characters in a row', () => {
    // lll at end of string
    expect(isPasswordStrong('aA1!bbccddeeffgghhiijjkklll')).toBe(true);
  });

  it('returns true when all restrictions met and length is greater than 19 characters', () => {
    expect(isPasswordStrong('aA1!bbccddeeffg12345')).toBe(true);
  });

  it('returns true when all restrictions met and length is greater than 15 characters', () => {
    expect(isPasswordStrong('aA1!bbccddeeffg')).toBe(true);
    expect(isPasswordStrong('aA1!bbccddeeffgg')).toBe(true);
  });
});
