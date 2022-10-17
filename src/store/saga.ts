import { all, call, spawn } from 'redux-saga/effects';

import { saga as web3 } from './web3/saga';
import { saga as zns } from './zns/saga';
import { saga as apps } from './apps/saga';
import { saga as channelsList } from './channels-list/saga';
import { saga as messages } from './messages/saga';
import { saga as authentication } from './authentication/saga';

export function* rootSaga() {
  const allSagas = {
    web3,
    zns,
    apps,
    channelsList,
    messages,
    authentication,
  };

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
