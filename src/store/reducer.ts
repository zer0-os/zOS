import { combineReducers } from 'redux';

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

export const rootReducer = combineReducers({
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
});

export type RootState = ReturnType<typeof rootReducer>;
