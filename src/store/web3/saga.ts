import { takeLatest, put, takeEvery, call, take } from 'redux-saga/effects';
import { SagaActionTypes, setConnectionStatus, setConnector, setWalletAddress } from '.';

import { ConnectionStatus, Connectors, personalSignToken } from '../../lib/web3';
import { web3Channel } from './channels';
import { getService as getProviderService } from '../../lib/web3/provider-service';
import { getProvider } from '../../lib/cloudinary/provider';

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

export function* getSignedToken(connector) {
  yield updateConnector({ payload: connector });

  // XXX: If you've already signed then the address won't change. Web3 needs to
  // be able to handle this case and just provide the address.
  const address = yield call(waitForAddressChange);

  const providerService = yield call(getProviderService);
  try {
    return yield call(personalSignToken, providerService.get(), address);
  } catch (error) {
    yield updateConnector(Connectors.None);
  }
  return null;
}

export function* waitForAddressChange() {
  const channel = yield call(web3Channel);
  const action = yield take(channel, 'ADDRESS_CHANGED');
  return action.payload;
}

export function* saga() {
  yield takeLatest(SagaActionTypes.UpdateConnector, updateConnector);
  // XXX: Temporary? Does this happen more organically based on other events?
  yield takeEvery(SagaActionTypes.SetAddress, setAddress);
}
