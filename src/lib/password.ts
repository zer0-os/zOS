export function passwordRulesDescription() {
  return 'Must include at least 8 characters, 1 number, 1 lowercase letter and 1 uppercase letter';
}

export function isPasswordStrong(password: string): boolean {
  if (password.trim() === '' || password.length < 8) {
    return false;
  }

  // check for 1 lowercase, 1 uppercase, 1 number
  if (!password.match(/[a-z]/) || !password.match(/[A-Z]/) || !password.match(/[0-9]/)) {
    return false;
  }

  return true;
}
