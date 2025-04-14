import { call, put, select, spawn, take, takeEvery } from 'redux-saga/effects';
import { schema, removeAll, receive, SagaActionTypes } from '.';
import { usersByMatrixIdsSelector } from './selectors';
import { getUserSubHandle } from '../../lib/user';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';
import { uploadFile, editProfile as matrixEditProfile } from '../../lib/chat';
import { getProvider as getIndexedDbProvider } from '../../lib/storage/media-cache/idb';
import { editUserProfile as apiEditUserProfile } from '../edit-profile/api';
import { User } from '../authentication/types';
import { getZeroUsersQuery } from './queries/getZeroUsersQuery';
import { queryClient } from '../../lib/web3/rainbowkit/provider';

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

/*
  If the user is logging in for the first time, we fetch the cached image (from indexed-db),
  and then call the edit profile API to update the profile image in the ZERO-API database.
  This is because the profile image could not be uploaded to the homeserver during registration
  (as the matrixClient was not initialized at that time).
*/
export function* updateUserProfileImageFromCache(currentUser: User) {
  const { firstName: name } = currentUser.profileSummary || {};
  const { primaryZID } = currentUser;

  const provider = yield call(getIndexedDbProvider);
  const profileImage: File = yield call([provider, provider.get], 'profileImage');

  if (profileImage) {
    const profileImageUrl = yield call(uploadFile, profileImage);
    const response = yield call(apiEditUserProfile, {
      name,
      primaryZID,
      profileImage: profileImageUrl || undefined,
    });
    if (response.success) {
      // also update the profile image & name in the homeserver user directory
      yield spawn(matrixEditProfile, { avatarUrl: profileImageUrl, displayName: name });

      return profileImageUrl;
    } else {
      console.error('Failed to update user profile on registration:', response.error);
    }
  } else {
    // only update the displayname if the user hasn't uploaded a profile image during registration
    yield spawn(matrixEditProfile, { displayName: name });
  }

  return undefined;
}

function* listenForUserLogin() {
  const userChannel = yield call(getAuthChannel);
  while (true) {
    yield take(userChannel, AuthEvents.UserLogin);
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
