import { RootState } from '../reducer';

export function userByMatrixIdSelector(state: RootState, matrixId: string) {
  return Object.values(state.normalized['users'] || {}).find((u: any) => u.matrixId === matrixId);
}
