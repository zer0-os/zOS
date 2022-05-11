import { all, call, spawn } from 'redux-saga/effects';

import { saga as web3 } from './web3/saga';
import { saga as zns } from './zns/saga';
import { saga as apps } from './apps/saga';
import { saga as channels } from './channels/saga';

export function* rootSaga() {
  const allSagas = [
    web3,
    zns,
    apps,
    channels,
  ];

  yield all(
    Object.keys(allSagas).map((sagaName) => {
      return spawn(function* () {
        try {
          yield call(allSagas[sagaName]);
        } catch (error) {
          console.log(`Saga [${sagaName}] has failed due to error.`, error);
        }
      });
    })
  );
}
