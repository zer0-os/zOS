import { call, put, select, takeEvery } from 'redux-saga/effects';
import { schema, removeAll, receive, SagaActionTypes } from '.';
import { Events, getChatBus } from '../chat/bus';
import { takeEveryFromBus } from '../../lib/saga';
import { userByMatrixId } from './selectors';

export function* clearUsers() {
  yield put(removeAll({ schema: schema.key }));
}

export function* receiveSearchResults(searchResults) {
  const existingUsers = (yield select((state) => state.normalized.users)) ?? {};
  const existingUserIds = Object.keys(existingUsers);

  const mappedUsers = searchResults
    .filter((r) => !existingUserIds.includes(r.id))
    .map((r) => {
      return { userId: r.id, firstName: r.name, profileImage: r.profileImage, matrixId: r.matrixId };
    });
  yield put(receive(mappedUsers));
}

export function* userPresenceChanged(matrixId: string, isOnline: boolean, lastSeenAt: string) {
  const user = yield call(userByMatrixId, matrixId);

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
