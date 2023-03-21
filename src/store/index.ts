import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { combineReducers } from 'redux';

import { rootSaga } from './saga';

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

const sagaMiddleware = createSagaMiddleware({
  onError: (e) => {
    console.error('Encountered uncaught error in root saga: ', e);
  },
});

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
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  middleware: (defaults) => defaults({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);
