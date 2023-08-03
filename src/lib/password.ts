export enum Strength {
  None = 0,
  Weak = 1,
  Acceptable = 2,
  Good = 3,
  Strong = 4,
}

export function passwordRulesDescription() {
  return 'Must include at least 8 characters, 1 number and 1 uppercase letter';
}

export function passwordStrength(password: string): any {
  if (password.trim() === '') {
    return Strength.None;
  }

  if (password.length < 8) {
    return Strength.Weak;
  }

  // check for 1 uppercase, 1 number
  if (!password.match(/[A-Z]/) || !password.match(/[0-9]/)) {
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
