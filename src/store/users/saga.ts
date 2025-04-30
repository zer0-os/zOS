import { call, put, select, spawn, take, takeEvery, delay } from 'redux-saga/effects';
import { schema, removeAll, receive, SagaActionTypes } from '.';
import { usersByMatrixIdsSelector } from './selectors';
import { getUserSubHandle } from '../../lib/user';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';
import { getZeroUsersQuery } from './queries/getZeroUsersQuery';
import { queryClient } from '../../lib/web3/rainbowkit/provider';
import { verifyMatrixProfileDisplayNameIsSynced as verifyMatrixProfileDisplayNameIsSyncedAPI } from '../../lib/chat';
import { currentUserSelector } from '../authentication/selectors';
import { isTelegramMatrixId } from '../../lib/chat/matrix/utils';
import Matrix from '../../lib/chat/matrix/matrix-client-instance';
import { MatrixAdapter } from '../../lib/chat/matrix/matrix-adapter';
import { User } from '../channels';
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

// there seems to be a bug where the profile info (displayname specifically) is not updated in the 'matrix' database
// so this is just a failsafe to ensure that the user profile (from zos-api) is synced with it's matrix state
export function* verifyMatrixProfileDisplayNameIsSynced() {
  const currentUser = yield select(currentUserSelector);
  const { firstName: displayName } = currentUser.profileSummary || {};
  yield call(verifyMatrixProfileDisplayNameIsSyncedAPI, displayName);
}

function* listenForUserLogin() {
  const userChannel = yield call(getAuthChannel);
  while (true) {
    yield take(userChannel, AuthEvents.UserLogin);
    yield spawn(verifyMatrixProfileDisplayNameIsSynced);
  }
}

export function* saga() {
  yield spawn(listenForUserLogin);

  yield takeEvery(SagaActionTypes.SearchResults, receiveSearchResultsAction);
}

export function* receiveSearchResultsAction(action) {
  return yield receiveSearchResults(action.payload);
}

/**
 * Fetches users by matrix ids and returns a map of users
 * This ensures that users who are not in the store are fetched from the API
 * and added to the store
 * @param matrixIds - array of matrix ids (gets deduplicated internally)
 * @returns map of users
 */
export function* getUsersByMatrixIds(matrixIds: string[]) {
  let users: Map<string, User> = yield select(usersByMatrixIdsSelector, matrixIds);

  // Handle Telegram users as we only have their information in Matrix.
  for (const matrixId of matrixIds) {
    const telegramUsers = [];
    if (isTelegramMatrixId(matrixId)) {
      const matrixUser = Matrix.client.getUser(matrixId);
      if (matrixUser) {
        const user = MatrixAdapter.mapMatrixUserToUser(matrixUser);
        telegramUsers.push(user);
      }
    }
    if (telegramUsers.length > 0) {
      yield put(receive(telegramUsers));
      users = yield select(usersByMatrixIdsSelector, matrixIds);
    }
  }

  // TODO: Once we have all user data in Matrix, we can try to load the user from there before fetching from the API
  // We still don't store primaryZID or primaryWalletAddress in Matrix, so we need to fetch them from the API
  const missingUsers = [...new Set(matrixIds)].filter((id) => !users.has(id));
  if (missingUsers.length > 0) {
    const apiUsers = yield call(() => queryClient.fetchQuery(getZeroUsersQuery(missingUsers))) ?? [];
    yield put(receive(apiUsers));
    users = yield select(usersByMatrixIdsSelector, matrixIds);
  }
  return users;
}

/**
 * Fetches a user by matrix id and returns the user
 * This ensures that users who are not in the store are fetched from the API
 * and added to the store
 * @param matrixId - matrix id
 * @returns user
 */
export function* getUserByMatrixId(matrixId: string) {
  const users: Map<string, User> = yield call(getUsersByMatrixIds, [matrixId]);
  return users.get(matrixId);
}

let pendingMatrixIds = new Set<string>();
let isProcessing = false;
/**
 * Batch processes matrix IDs by accumulating them and processing every 500ms
 * @param matrixId - matrix id to add to the batch
 */
export function* batchGetUsersByMatrixId(matrixId: string) {
  pendingMatrixIds.add(matrixId);

  if (!isProcessing) {
    isProcessing = true;
    yield delay(500);

    const matrixIds = Array.from(pendingMatrixIds);
    pendingMatrixIds.clear();
    isProcessing = false;

    yield spawn(getUsersByMatrixIds, matrixIds);
  }
}
