import getDeepProperty from 'lodash.get';
import { put } from 'redux-saga/effects';
import { update } from './';
import { User } from '../authentication/types';

export const getKeyWithUserId = (key: string) => (state) => {
  const user: User = getDeepProperty(state, 'authentication.user.data', null);

  if (user) {
    return keyForUser(user.id, key);
  }
};

function keyForUser(id: string, key: string) {
  return `${id}-${key}`;
}

export function* initializeUserLayout(_user: { id: string; isAMemberOfWorlds: boolean }) {
  const isMessengerFullScreen = true; // The main app view of zOS is no longer used

  yield put(
    update({
      isMessengerFullScreen,
    })
  );
}

export function* initializePublicLayout() {
  yield put(
    update({
      isMessengerFullScreen: true,
    })
  );
}

export function* clearUserLayout() {
  yield put(
    update({
      isMessengerFullScreen: true,
    })
  );
}

export function* saga() {}
