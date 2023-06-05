import { multicastChannel } from 'redux-saga';
import { call } from 'redux-saga/effects';

export enum Events {
  UserLogin = 'user/login',
  UserLogout = 'user/logout',
}

let theChannel;
export function* getAuthChannel() {
  if (!theChannel) {
    theChannel = yield call(multicastChannel);
  }
  return theChannel;
}
