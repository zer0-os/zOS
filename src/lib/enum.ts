// Ensure all enum values are handled
export function assertAllValuesConsumed(x: never): never {
  throw new Error('Unexpected type: ' + x);
}
