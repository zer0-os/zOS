import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import { rootSaga } from './saga';

import { reducer as feed } from './feed';
import { reducer as web3 } from './web3';

const sagaMiddleware = createSagaMiddleware({
  onError: (e) => {
    console.error('Encountered uncaught error in root saga: ', e);
  },
});

export const store = configureStore({
  reducer: {
    feed,
    web3,
  },
  middleware: (defaults) => defaults({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
