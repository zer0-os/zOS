import { takeLatest, put, takeEvery, call, take } from 'redux-saga/effects';
import { SagaActionTypes, setConnectionStatus, setConnector, setWalletAddress } from '.';

import { ConnectionStatus, Connectors, personalSignToken } from '../../lib/web3';
import { web3Channel } from './channels';
import { getService } from '../../lib/web3/provider-service';

export function* updateConnector(action) {
  console.log('updating connector', action.payload);
  yield put(setConnector(action.payload));
  yield put(setConnectionStatus(ConnectionStatus.Connecting));
}

export function* setAddress(action) {
  console.log('setting address?', action);
  yield put(setWalletAddress(action.payload));
  // Publish a system message across the channel
  const channel = yield call(web3Channel);
  console.log('publishing!!', action.payload);
  yield put(channel, { type: 'ADDRESS_CHANGED', payload: action.payload });
}

export function* getSignedToken(connector) {
  yield updateConnector({ payload: connector });

  // XXX: If you've already signed then the address won't change. Web3 needs to
  // be able to handle this case and just provide the address.
  const channel = yield call(web3Channel);
  const addressChangedAction = yield take(channel, 'ADDRESS_CHANGED');
  console.log('got a multicast', addressChangedAction);

  // XXX: if address is null....
  const address = addressChangedAction.payload;

  const provider = yield getService().get();
  try {
    return yield personalSignToken(provider, address);
  } catch (error) {
    yield updateConnector(Connectors.None);
  }
  return null;
}

export function* saga() {
  yield takeLatest(SagaActionTypes.UpdateConnector, updateConnector);
  // XXX: Temporary? Does this happen more organically based on other events?
  yield takeEvery(SagaActionTypes.SetAddress, setAddress);
}
