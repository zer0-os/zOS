import { RootState } from '../reducer';

export function userByMatrixId(state: RootState, matrixId: string) {
  return Object.values(state.normalized['users'] || {}).find((u: any) => u.matrixId === matrixId);
}
