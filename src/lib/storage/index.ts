export function resolveFromLocalStorageAsBoolean(key) {
  const value = localStorage.getItem(key);

  if (value === null || value === 'true') return true;

  return false;
}
