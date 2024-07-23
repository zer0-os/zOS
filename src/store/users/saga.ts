import { call, put, select, takeEvery } from 'redux-saga/effects';
import { schema, removeAll, receive, SagaActionTypes } from '.';
import { userByMatrixIdSelector } from './selectors';
import { getZEROUsers as getZEROUsersAPI } from '../channels-list/api';
import { getUserSubHandle } from '../../lib/user';

export function* clearUsers() {
  yield put(removeAll({ schema: schema.key }));
}

export function* receiveSearchResults(searchResults) {
  const existingUsers = (yield select((state) => state.normalized.users)) ?? {};
  const existingUserIds = Object.keys(existingUsers);

  const mappedUsers = searchResults
    .filter((r) => !existingUserIds.includes(r.id))
    .map((r) => {
      return {
        userId: r.id,
        firstName: r.name,
        profileImage: r.profileImage,
        matrixId: r.matrixId,
        primaryZID: r.primaryZID,
        primaryWalletAddress: r.primaryWalletAddress,
        displaySubHandle: getUserSubHandle(r.primaryZID, r.primaryWalletAddress),
      };
    });
  yield put(receive(mappedUsers));
}

export function* saga() {
  yield takeEvery(SagaActionTypes.SearchResults, receiveSearchResultsAction);
}

export function* receiveSearchResultsAction(action) {
  return yield receiveSearchResults(action.payload);
}

export function* getUserByMatrixId(matrixId: string) {
  let user = yield select(userByMatrixIdSelector, matrixId);
  if (!user) {
    user = (yield call(getZEROUsersAPI, [matrixId]) ?? [])[0];
  }
  return user;
}
