import { call, select } from 'redux-saga/effects';
import { getZEROUsers as getZEROUsersAPI } from '../channels-list/api';

export function* userByMatrixId(matrixId: string) {
  const usersFromState = (yield select((state) => state.normalized.users)) ?? {};
  let user = Object.values(usersFromState).find((u: any) => u.matrixId === matrixId);
  if (!user) {
    user = (yield call(getZEROUsersAPI, [matrixId]) ?? [])[0];
  }
  return user;
}
