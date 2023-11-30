import { combineReducers } from 'redux';

import { reducer as pageload } from './page-load';
import { reducer as layout } from './layout';
import { reducer as channelsList } from './channels-list';
import { reducer as web3 } from './web3';
import { reducer as zns } from './zns';
import { reducer as theme } from './theme';
import { reducer as apps } from './apps';
import { reducer as normalized } from './normalized';
import { reducer as authentication } from './authentication';
import { reducer as chat } from './chat';
import { reducer as notificationsList } from './notifications';
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

export const rootReducer = combineReducers({
  pageload,
  layout,
  channelsList,
  web3,
  zns,
  theme,
  apps,
  normalized,
  authentication,
  chat,
  notificationsList,
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
});

export type RootState = ReturnType<typeof rootReducer>;
