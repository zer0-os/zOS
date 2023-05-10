import { all, call, spawn } from 'redux-saga/effects';

import { saga as web3 } from './web3/saga';
import { saga as zns } from './zns/saga';
import { saga as apps } from './apps/saga';
import { saga as channelsList } from './channels-list/saga';
import { saga as messages } from './messages/saga';
import { saga as channels } from './channels/saga';
import { saga as authentication } from './authentication/saga';
import { saga as chat } from './chat/saga';
import { saga as theme } from './theme/saga';
import { saga as layout } from './layout/saga';
import { saga as notificationsList } from './notifications/saga';
import { saga as createConversation } from './create-conversation/saga';
import { saga as createInvitation } from './create-invitation/saga';
import { saga as registration } from './registration/saga';
import { saga as login } from './login/saga';
import { saga as rewards } from './rewards/saga';

export function* rootSaga() {
  const allSagas = {
    web3,
    zns,
    apps,
    channelsList,
    channels,
    messages,
    authentication,
    chat,
    theme,
    layout,
    notificationsList,
    createConversation,
    createInvitation,
    registration,
    login,
    rewards,
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
