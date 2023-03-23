export function resolveFromLocalStorageAsBoolean(key: string, defaultValue: boolean) {
  const value = localStorage.getItem(key);

  if (value === 'false') {
    return false;
  } else if (value === 'true') {
    return true;
  }

  return defaultValue;
}
