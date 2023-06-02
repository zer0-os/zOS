import { take, put, call, race, spawn } from 'redux-saga/effects';
import { SagaActionTypes, reset, setInvite } from '.';
import { getInvite } from './api';
import { config } from '../../config';
import { authChannel } from '../authentication/saga';

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

export function* saga() {
  const channel = yield call(authChannel);

  while (true) {
    const { userId = undefined } = yield take(channel, '*');

    if (userId) {
      yield spawn(fetchInvite);
    } else {
      yield put({ type: SagaActionTypes.Cancel });
    }
  }
}
