import { all, call, spawn } from 'redux-saga/effects';

import { saga as theme } from './theme/saga';
import { saga as notificationsList } from './notifications/saga';

export function* rootSaga() {
  const allSagas = {
    theme,
    notificationsList,
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
