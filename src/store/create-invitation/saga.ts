import { put, call, takeLatest } from 'redux-saga/effects';
import { SagaActionTypes, reset, setInvite } from '.';
import { getInvite } from './api';
import { config } from '../../config';

export function* fetchInvite() {
  // reset before fetching
  yield put(reset());

  try {
    const invitation = yield call(getInvite);
    console.log('invitation', invitation);

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

export function* saga() {
  yield takeLatest(SagaActionTypes.GetCode, fetchInvite);
}
