import { all, put, select } from 'redux-saga/effects';
import { schema, remove } from '../users';
import getDeepProperty from 'lodash.get';

const rawAllUsersSelector = (state) => {
  return getDeepProperty(state, `normalized.${schema.key}`, {});
};

export function* clearUsers() {
  const normalized = yield select((state) => {
    return rawAllUsersSelector(state);
  });

  yield all([
    ...Object.keys(normalized).map((id) => {
      return put(remove({ schema: schema.key, id }));
    }),
  ]);
}
