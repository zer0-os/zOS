import { put, select, takeEvery } from 'redux-saga/effects';
import { schema, removeAll, receive, SagaActionTypes } from '.';

export function* clearUsers() {
  yield put(removeAll({ schema: schema.key }));
}

export function* receiveSearchResults(searchResults) {
  const existingUsers = (yield select((state) => state.normalized.users)) ?? {};
  const existingUserIds = Object.keys(existingUsers);

  const mappedUsers = searchResults
    .filter((r) => !existingUserIds.includes(r.id))
    .map((r) => ({ userId: r.id, firstName: r.name, profileImage: r.profileImage }));
  yield put(receive(mappedUsers));
}

export function* saga() {
  yield takeEvery(SagaActionTypes.SearchResults, receiveSearchResultsAction);
}

export function* receiveSearchResultsAction(action) {
  return yield receiveSearchResults(action.payload);
}
