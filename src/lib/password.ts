export function passwordStrength(password: string): any {
  if (password.length < 8) {
    return 0;
  }

  if (!password.match(/[a-z]/)) {
    return 0;
  }

  if (!password.match(/[A-Z]/)) {
    return 0;
  }

  if (!password.match(/[!@#$%^&*]/)) {
    return 0;
  }

  if (!password.match(/[0-9]/)) {
    return 0;
  }

  if (hasMoreThan2IdenticalCharactiersInARow(password)) {
    return 1;
  }

  if (password.length < 10) {
    return 1;
  }

  if (password.length < 16) {
    return 2;
  }

  return 3;
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
