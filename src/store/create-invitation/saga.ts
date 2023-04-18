import { take, put, call, race } from 'redux-saga/effects';
import { SagaActionTypes, setInvite } from '.';
import { getInvite } from './api';
import { config } from '../../config';
import { authChannel } from '../authentication/saga';

export function* fetchInvite() {
  const code = yield call(getInvite);
  // For now, we don't include the code in he url
  yield put(setInvite({ code, url: config.inviteUrl }));
}

export function* saga() {
  const channel = yield call(authChannel);
  while (true) {
    let payload = yield take(channel, '*');
    if (payload.userId) {
      yield race({
        logout: yield take(channel, '*'),
        fetchInvite: yield take(SagaActionTypes.GetCode),
      });

      if (fetchInvite) {
        yield call(fetchInvite);
      }
    }
  }
}
