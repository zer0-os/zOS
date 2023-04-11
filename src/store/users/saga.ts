import { put } from 'redux-saga/effects';
import { schema, removeAll } from '../users';

export function* clearUsers() {
  yield put(removeAll({ schema: schema.key }));
}
