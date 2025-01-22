import { combineReducers } from 'redux';

import { reducer as pageload } from './page-load';
import { reducer as channelsList } from './channels-list';
import { reducer as web3 } from './web3';
import { reducer as theme } from './theme';
import { reducer as normalized } from './normalized';
import { reducer as authentication } from './authentication';
import { reducer as chat } from './chat';
import { reducer as createConversation } from './create-conversation';
import { reducer as createInvitation } from './create-invitation';
import { reducer as registration } from './registration';
import { reducer as login } from './login';
import { reducer as rewards } from './rewards';
import { reducer as editProfile } from './edit-profile';
import { reducer as requestPasswordReset } from './request-password-reset';
import { reducer as confirmPasswordReset } from './confirm-password-reset';
import { reducer as matrix } from './matrix';
import { reducer as groupManagement } from './group-management';
import { reducer as dialogs } from './dialogs';
import { reducer as messageInfo } from './message-info';
import { reducer as userProfile } from './user-profile';
import { reducer as background } from './background';
import { reducer as accountManagement } from './account-management';
import { reducer as posts } from './posts';
import { reducer as reportUser } from './report-user';
import { reducer as thirdweb } from './thirdweb';

export const rootReducer = combineReducers({
  pageload,
  channelsList,
  web3,
  theme,
  normalized,
  authentication,
  chat,
  createConversation,
  createInvitation,
  registration,
  login,
  rewards,
  editProfile,
  requestPasswordReset,
  confirmPasswordReset,
  matrix,
  groupManagement,
  dialogs,
  messageInfo,
  userProfile,
  background,
  accountManagement,
  posts,
  reportUser,
  thirdweb,
});

export type RootState = ReturnType<typeof rootReducer>;
