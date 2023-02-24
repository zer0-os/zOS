export function resolveFromLocalStorageAsBoolean(key) {
  const value = localStorage.getItem(key);

  return value === null || value === 'true';
}
