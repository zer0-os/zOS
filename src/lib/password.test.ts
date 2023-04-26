import { passwordStrength } from './password';

describe('passwordStrength', () => {
  it('should return 0 for any password less than 8 characters', () => {
    expect(passwordStrength('')).toBe(0);
    expect(passwordStrength('1')).toBe(0);
    expect(passwordStrength('1234567')).toBe(0);
    expect(passwordStrength('aA1!aaa')).toBe(0);
  });

  it('requires 1 lowercase letter', () => {
    expect(passwordStrength('AA1!AAAA')).toBe(0);
    expect(passwordStrength('aA1!AAAA')).toBe(1);
  });

  it('requires 1 uppercase letter', () => {
    expect(passwordStrength('aa1!aaaa')).toBe(0);
    expect(passwordStrength('aA1!aaaa')).toBe(1);
  });

  it('requires 1 number', () => {
    expect(passwordStrength('aAa!aaaa')).toBe(0);
    expect(passwordStrength('aA1!aaaa')).toBe(1);
  });

  it('requires 1 special character', () => {
    expect(passwordStrength('aA1abbcc')).toBe(0);
    expect(passwordStrength('aA1!bbcc')).toBe(1);
    expect(passwordStrength('aA1@bbcc')).toBe(1);
    expect(passwordStrength('aA1#bbcc')).toBe(1);
    expect(passwordStrength('aA1$bbcc')).toBe(1);
    expect(passwordStrength('aA1%bbcc')).toBe(1);
    expect(passwordStrength('aA1^bbcc')).toBe(1);
    expect(passwordStrength('aA1&bbcc')).toBe(1);
    expect(passwordStrength('aA1*bbcc')).toBe(1);
  });

  it('returns 1 for any password with more than 2 identical characters in a row', () => {
    // lll at end of string
    expect(passwordStrength('aA1!bbccddeeffgghhiijjkklll')).toBe(1);
  });

  it('returns 3 when all restrictions met and length is greater than 19 characters', () => {
    expect(passwordStrength('aA1!bbccdd')).toBe(2);
  });

  it('returns 3 when all restrictions met and length is greater than 15 characters', () => {
    expect(passwordStrength('aA1!bbccddeeffg')).toBe(2);
    expect(passwordStrength('aA1!bbccddeeffgg')).toBe(3);
  });
});
