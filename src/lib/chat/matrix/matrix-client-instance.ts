import { MatrixClient } from '../matrix-client';

class MatrixInstance {
  private _clientInstance: MatrixClient;

  constructor() {
    this._clientInstance = new MatrixClient();
  }

  get client() {
    return this._clientInstance;
  }

  resetClientInstance() {
    this._clientInstance.disconnect();
    this._clientInstance = new MatrixClient();
  }
}

const Matrix = new MatrixInstance();
export default Matrix;
