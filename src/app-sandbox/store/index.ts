import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import { rootSaga } from './saga';

import { reducer as zns } from './zns';
import { reducer as web3 } from './web3';
import { reducer as feed } from '../../apps/feed/store';

const sagaMiddleware = createSagaMiddleware({
  onError: (e) => {
    console.error('Encountered uncaught error in root saga: ', e);
  },
});

export const store = configureStore({
  reducer: {
    zns,
    web3,
    feed,
  },
  middleware: (defaults) => defaults({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export const { dispatch } = store;
export type RootState = ReturnType<typeof store.getState>;
