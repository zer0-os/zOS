export enum Strength {
  None = 0,
  Weak = 1,
  Acceptable = 2,
  Good = 3,
  Strong = 4,
}

export function passwordStrength(password: string): any {
  if (password.trim() === '') {
    return Strength.None;
  }

  if (password.length < 8) {
    return Strength.Weak;
  }

  if (
    !password.match(/[a-z]/) ||
    !password.match(/[A-Z]/) ||
    !password.match(/[!@#$%^&*]/) ||
    !password.match(/[0-9]/)
  ) {
    return Strength.Weak;
  }

  if (hasMoreThan2IdenticalCharactiersInARow(password) || password.length < 10) {
    return Strength.Acceptable;
  }

  if (password.length < 16) {
    return Strength.Good;
  }

  return Strength.Strong;
}

export function hasMoreThan2IdenticalCharactiersInARow(password: string): any {
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
      return true;
    }
  }
  return false;
}

// Function returns a string explaining the password rules:
// return 1 if
// 8 characters
// 1 lowercase
// 1 uppercase
// 1 number
// 1 special character
// XXX
export function passwordRulesDescription(): any {
  return '8 characters, 1 lowercase, 1 uppercase, 1 number, 1 special character';
}
