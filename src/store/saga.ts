import { all, call, spawn } from 'redux-saga/effects';

import { saga as feed } from './feed/saga';
import { saga as web3 } from './web3/saga';

export function* rootSaga() {
  const allSagas = [
    feed,
    web3,
  ];

  yield all(Object.keys(allSagas).map(sagaName => {
    return spawn(function*() {
      try {
        yield call(allSagas[sagaName]);
      } catch (error) {
        console.log(`Saga [${sagaName}] has failed due to error.`, error);
      }
    });
  }));
}

