import { Strength, passwordStrength } from './password';

describe('passwordStrength', () => {
  it('should return None a blank password', () => {
    expect(passwordStrength('')).toBe(Strength.None);
  });

  it('should return Weak for any password less than 8 characters', () => {
    expect(passwordStrength('1')).toBe(Strength.Weak);
    expect(passwordStrength('1234567')).toBe(Strength.Weak);
    expect(passwordStrength('aA1!aaa')).toBe(Strength.Weak);
  });

  it('requires 1 lowercase letter', () => {
    expect(passwordStrength('AA1!AAAA')).toBe(Strength.Weak);
    expect(passwordStrength('aA1!AAAA')).toBe(Strength.Acceptable);
  });

  it('requires 1 uppercase letter', () => {
    expect(passwordStrength('aa1!aaaa')).toBe(Strength.Weak);
    expect(passwordStrength('aA1!aaaa')).toBe(Strength.Acceptable);
  });

  it('requires 1 number', () => {
    expect(passwordStrength('aAa!aaaa')).toBe(Strength.Weak);
    expect(passwordStrength('aA1!aaaa')).toBe(Strength.Acceptable);
  });

  it('requires 1 special character', () => {
    expect(passwordStrength('aA1abbcc')).toBe(Strength.Weak);
    expect(passwordStrength('aA1!bbcc')).toBe(Strength.Acceptable);
    expect(passwordStrength('aA1@bbcc')).toBe(Strength.Acceptable);
    expect(passwordStrength('aA1#bbcc')).toBe(Strength.Acceptable);
    expect(passwordStrength('aA1$bbcc')).toBe(Strength.Acceptable);
    expect(passwordStrength('aA1%bbcc')).toBe(Strength.Acceptable);
    expect(passwordStrength('aA1^bbcc')).toBe(Strength.Acceptable);
    expect(passwordStrength('aA1&bbcc')).toBe(Strength.Acceptable);
    expect(passwordStrength('aA1*bbcc')).toBe(Strength.Acceptable);
  });

  it('returns Acceptable for any password with more than 2 identical characters in a row', () => {
    // lll at end of string
    expect(passwordStrength('aA1!bbccddeeffgghhiijjkklll')).toBe(Strength.Acceptable);
  });

  it('returns Good when all restrictions met and length is greater than 19 characters', () => {
    expect(passwordStrength('aA1!bbccdd')).toBe(Strength.Good);
  });

  it('returns Strong when all restrictions met and length is greater than 15 characters', () => {
    expect(passwordStrength('aA1!bbccddeeffg')).toBe(Strength.Good);
    expect(passwordStrength('aA1!bbccddeeffgg')).toBe(Strength.Strong);
  });
});
