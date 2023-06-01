import { takeLatest, put, takeEvery, call, take, select, race } from 'redux-saga/effects';
import { SagaActionTypes, setConnectionStatus, setConnector, setWalletAddress, setWalletConnectionError } from '.';

import { ConnectionStatus, Connectors, personalSignToken } from '../../lib/web3';
import { web3Channel } from './channels';
import { getService as getProviderService } from '../../lib/web3/provider-service';

export function* updateConnector(action) {
  yield put(setConnector(action.payload));
  yield put(setConnectionStatus(ConnectionStatus.Connecting));
}

export function* setAddress(action) {
  yield put(setWalletAddress(action.payload));

  // Publish a system message across the channel
  const channel = yield call(web3Channel);
  yield put(channel, { type: 'ADDRESS_CHANGED', payload: action.payload });
}

export function* setConnectionError(action) {
  yield put(setWalletConnectionError(action.payload));

  if (action.payload) {
    // Publish a system message across the channel
    const channel = yield call(web3Channel);
    yield put(channel, { type: 'CONNECTION_ERROR', payload: action.payload });
  }
}

export function* getSignedToken(connector) {
  let current = yield select((state) => state.web3.value);

  let address = current.address;
  if (current.connector !== connector || !current.address) {
    yield updateConnector({ payload: connector });
    const result = yield race({
      address: call(waitForAddressChange),
      error: call(waitForError),
    });
    if (result.error) {
      return { success: false, error: result.error };
    }
    address = result.address;
  }

  const providerService = yield call(getProviderService);
  try {
    const token = yield call(personalSignToken, providerService.get(), address);
    return { success: true, token };
  } catch (error) {
    yield updateConnector({ payload: Connectors.None });
    return { success: false, error: 'Error signing token' };
  }
}

export function* waitForAddressChange() {
  const channel = yield call(web3Channel);
  const action = yield take(channel, 'ADDRESS_CHANGED');
  return action.payload;
}

export function* waitForError() {
  const channel = yield call(web3Channel);
  const action = yield take(channel, 'CONNECTION_ERROR');
  return action.payload;
}

export function* saga() {
  yield takeLatest(SagaActionTypes.UpdateConnector, updateConnector);
  yield takeEvery(SagaActionTypes.SetAddress, setAddress);
  yield takeEvery(SagaActionTypes.SetConnectionError, setConnectionError);
}
