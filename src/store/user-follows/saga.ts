import { call, put, takeLatest } from 'redux-saga/effects';
import { SagaActionTypes, followUser, unfollowUser, getFollowStatus, setError, setLoading } from '.';
import {
  followUser as apiFollowUser,
  unfollowUser as apiUnfollowUser,
  getFollowStatus as apiGetFollowStatus,
  FollowError,
} from './api';

export function* handleFollowUser(action: ReturnType<typeof followUser>) {
  try {
    const { followingId } = action.payload;
    yield put(setLoading(true));
    yield put(setError(null));
    yield call(apiFollowUser, followingId);
    yield put(getFollowStatus({ followingId }));
  } catch (error: any) {
    console.error('Error following user:', error);
    yield put(setError(error.message || FollowError.FAILED_TO_FOLLOW));
  } finally {
    yield put(setLoading(false));
  }
}

export function* handleUnfollowUser(action: ReturnType<typeof unfollowUser>) {
  try {
    const { followingId } = action.payload;
    yield put(setLoading(true));
    yield put(setError(null));
    yield call(apiUnfollowUser, followingId);
    yield put(getFollowStatus({ followingId }));
  } catch (error: any) {
    console.error('Error unfollowing user:', error);
    yield put(setError(error.message || FollowError.FAILED_TO_UNFOLLOW));
  } finally {
    yield put(setLoading(false));
  }
}

export function* handleGetFollowStatus(action: ReturnType<typeof getFollowStatus>) {
  try {
    const { followingId } = action.payload;
    yield put(setLoading(true));
    yield put(setError(null));
    const _status = yield call(apiGetFollowStatus, followingId);
    // Update the follow status in the store
    // This will be handled by the reducer
  } catch (error: any) {
    console.error('Error getting follow status:', error);
    yield put(setError(error.message));
  } finally {
    yield put(setLoading(false));
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.FollowUser, handleFollowUser);
  yield takeLatest(SagaActionTypes.UnfollowUser, handleUnfollowUser);
  yield takeLatest(SagaActionTypes.GetFollowStatus, handleGetFollowStatus);
}
