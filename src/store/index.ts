import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { combineReducers } from 'redux';

import { rootSaga } from './saga';

import { reducer as channelsList } from './channels-list';
import { reducer as web3 } from './web3';
import { reducer as zns } from './zns';
import { reducer as theme } from './theme';
import { reducer as apps } from './apps';
import { reducer as normalized } from './normalized';

const sagaMiddleware = createSagaMiddleware({
  onError: (e) => {
    console.error('Encountered uncaught error in root saga: ', e);
  },
});

export const rootReducer = combineReducers({
  channelsList,
  web3,
  zns,
  theme,
  apps,
  normalized,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  middleware: (defaults) => defaults({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);
