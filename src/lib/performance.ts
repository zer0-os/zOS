/**
 * Utility functions for performance measurement using the Performance API
 */

/**
 * Start a performance measurement with the given name
 * @param name Unique identifier for the measurement
 */
export function startMeasurement(name: string) {
  performance.mark(`${name}-start`);
}

/**
 * End a performance measurement with the given name and log the duration
 * @param name Unique identifier for the measurement (must match a previous startMeasurement call)
 */
export function endMeasurement(name: string) {
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;

  try {
    performance.mark(endMark);
    performance.measure(name, startMark, endMark);

    const [measure] = performance.getEntriesByName(name, 'measure');
    console.log(`📊 Performance: ${name} took ${measure.duration.toFixed(2)}ms`);

    // Cleanup to prevent memory leaks
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(name);
  } catch (error) {
    console.warn(`Failed to measure "${name}":`, error);
  }
}

/**
 * Wrap an async function with performance measurement
 * @param name Unique identifier for the measurement
 * @param fn Async function to measure
 */
export async function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  startMeasurement(name);
  try {
    const result = await fn();
    endMeasurement(name);
    return result;
  } catch (error) {
    endMeasurement(name);
    throw error;
  }
}
