export class MatrixInitializationError extends Error {
  constructor(message: string = 'Matrix initialization failed') {
    super(message);
    this.name = 'MatrixInitializationError';
  }
}
