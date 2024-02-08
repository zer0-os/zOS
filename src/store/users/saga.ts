import { call, put, select, takeEvery } from 'redux-saga/effects';
import { schema, removeAll, receive, SagaActionTypes } from '.';
import { Events, getChatBus } from '../chat/bus';
import { takeEveryFromBus } from '../../lib/saga';
import { userByMatrixIdSelector } from './selectors';
import { getZEROUsers as getZEROUsersAPI } from '../channels-list/api';
import { getUserHandle } from '../../components/messenger/lib/utils';

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
        displaySubHandle: getUserHandle(r.primaryZID, r.primaryWalletAddress),
      };
    });
  console.log(mappedUsers);
  yield put(receive(mappedUsers));
}

export function* userPresenceChanged(matrixId: string, isOnline: boolean, lastSeenAt: string) {
  const user = yield select(userByMatrixIdSelector, matrixId);

  if (!user) {
    return;
  }

  yield put(receive({ userId: user.userId, isOnline, lastSeenAt }));
}

export function* saga() {
  yield takeEvery(SagaActionTypes.SearchResults, receiveSearchResultsAction);

  const chatBus = yield call(getChatBus);
  yield takeEveryFromBus(chatBus, Events.UserPresenceChanged, userPresenceChangedAction);
}

function* userPresenceChangedAction(action) {
  yield userPresenceChanged(action.payload.matrixId, action.payload.isOnline, action.payload.lastSeenAt);
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
