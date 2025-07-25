import { all, call, spawn } from 'redux-saga/effects';

import { saga as web3 } from './web3/saga';
import { saga as channelsList } from './channels-list/saga';
import { saga as messages } from './messages/saga';
import { saga as channels } from './channels/saga';
import { saga as authentication } from './authentication/saga';
import { saga as chat } from './chat/saga';
import { saga as theme } from './theme/saga';
import { saga as createConversation } from './create-conversation/saga';
import { saga as createInvitation } from './create-invitation/saga';
import { saga as registration } from './registration/saga';
import { saga as login } from './login/saga';
import { saga as rewards } from './rewards/saga';
import { saga as pageLoad } from './page-load/saga';
import { saga as editProfile } from './edit-profile/saga';
import { saga as users } from './users/saga';
import { saga as requestPasswordReset } from './request-password-reset/saga';
import { saga as confirmPasswordReset } from './confirm-password-reset/saga';
import { saga as matrix } from './matrix/saga';
import { saga as groupManagement } from './group-management/saga';
import { saga as messageInfo } from './message-info/saga';
import { saga as userProfile } from './user-profile/saga';
import { saga as background } from './background/saga';
import { saga as accountManagement } from './account-management/saga';
import { saga as posts } from './posts/saga';
import { saga as notifications } from './notifications/saga';
import { saga as reportUser } from './report-user/saga';
import { saga as thirdweb } from './thirdweb/saga';
import { saga as activeZApp } from './active-zapp/saga';
import { saga as userFollows } from './user-follows/saga';
import { saga as wallet } from './wallet/saga';

export function* rootSaga() {
  const allSagas = {
    pageLoad,
    web3,
    channelsList,
    channels,
    messages,
    authentication,
    chat,
    theme,
    createConversation,
    createInvitation,
    registration,
    login,
    rewards,
    editProfile,
    users,
    requestPasswordReset,
    confirmPasswordReset,
    matrix,
    groupManagement,
    messageInfo,
    userProfile,
    background,
    accountManagement,
    posts,
    notifications,
    reportUser,
    thirdweb,
    activeZApp,
    userFollows,
    wallet,
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
