import { put, call, takeLeading } from 'redux-saga/effects';
import { SagaActionTypes, reset, setInviteDetails, setLoading } from '.';
import { getInvite } from './api';
import { config } from '../../config';
import { takeEveryFromBus } from '../../lib/saga';
import { getAuthChannel, Events as AuthEvents } from '../authentication/channels';

export function* fetchInvite() {
  // reset before fetching
  yield put(reset());

  try {
    yield put(setLoading(true));

    const invitation = yield call(getInvite);

    // For now, we don't include the code in the url
    yield put(
      setInviteDetails({
        code: invitation.slug,
        url: config.inviteUrl,
        inviteCount: invitation.inviteCount,
      })
    );
    return;
  } catch (e) {
    // Listen again
  } finally {
    yield put(setLoading(false));
  }
}

function* clearOnLogout() {
  yield put(reset());
}

export function* clearInvite() {
  yield put(reset());
}

export function* saga() {
  yield takeLeading(SagaActionTypes.GetCode, fetchInvite);
  yield takeEveryFromBus(yield call(getAuthChannel), AuthEvents.UserLogout, clearOnLogout);
  yield takeLeading(SagaActionTypes.Cancel, clearInvite);
}
