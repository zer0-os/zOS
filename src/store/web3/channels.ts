import { multicastChannel } from 'redux-saga';
import { call } from 'redux-saga/effects';

export enum Web3Events {
  AddressChanged = 'web3/address-changed',
}

let theWeb3Channel;
export function* web3Channel() {
  if (!theWeb3Channel) {
    theWeb3Channel = yield call(multicastChannel);
  }
  return theWeb3Channel;
}
