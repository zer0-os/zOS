import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { combineReducers } from 'redux';

import { rootSaga } from './saga';

import { reducer as theme } from './theme';
import { reducer as normalized } from './normalized';
import { reducer as notificationsList } from './notifications';

const sagaMiddleware = createSagaMiddleware({
  onError: (e) => {
    console.error('Encountered uncaught error in root saga: ', e);
  },
});

export const rootReducer = combineReducers({
  theme,
  normalized,
  notificationsList,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  middleware: (defaults) => defaults({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);
