import { MatrixClient } from '../matrix-client';
import { featureFlags } from '../../feature-flags';

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
if (featureFlags.enableMatrixDebug) {
  // @ts-ignore
  window.Matrix = Matrix;
}

export default Matrix;
