import { all, call, spawn } from 'redux-saga/effects';

import { saga as feed } from '../../apps/feed/saga';

export function* rootSaga() {
  const allSagas = [
    feed,
  ];

  yield all(Object.keys(allSagas).map(sagaName => {
    return spawn(function*() {
      try {
        yield call(allSagas[sagaName]);
      } catch (error) {
        console.log(`App Sandbox - Saga [${sagaName}] has failed due to error.`, error);
      }
    });
  }));
}

