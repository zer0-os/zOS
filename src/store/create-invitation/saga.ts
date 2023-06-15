import { take, put, call, race, spawn, takeEvery } from 'redux-saga/effects';
import { SagaActionTypes, reset, setInvite } from '.';
import { getInvite } from './api';
import { config } from '../../config';
import { Events, getAuthChannel } from '../authentication/channels';

export function* fetchInvite() {
  while (true) {
    const { cancel } = yield race({
      cancel: take(SagaActionTypes.Cancel),
      get: take(SagaActionTypes.GetCode),
    });

    if (cancel) {
      return yield put(reset());
    }

    try {
      const invitation = yield call(getInvite);
      // For now, we don't include the code in the url
      yield put(
        setInvite({
          code: invitation.slug,
          url: config.inviteUrl,
          invitesUsed: invitation.invitesUsed,
          maxUses: invitation.maxInvitesPerUser,
        })
      );
      return;
    } catch (e) {
      // Listen again
    }
  }
}

function* listenForUserLogin() {
  const authChannel = yield call(getAuthChannel);
  while (true) {
    yield take(authChannel, Events.UserLogin);
    yield spawn(fetchInvite);
  }
}

function* listenForUserLogout() {
  const authChannel = yield call(getAuthChannel);
  while (true) {
    yield take(authChannel, Events.UserLogout);
    yield put({ type: SagaActionTypes.Cancel });
  }
}

export function* saga() {
  yield spawn(listenForUserLogin);
  yield spawn(listenForUserLogout);
  yield takeEvery(SagaActionTypes.GetCode, fetchInvite);
}
