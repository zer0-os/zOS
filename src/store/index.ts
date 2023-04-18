import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import { rootSaga } from './saga';
import { rootReducer } from './reducer';

const sagaMiddleware = createSagaMiddleware({
  onError: (e) => {
    console.error('Encountered uncaught error in root saga: ', e);
  },
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (defaults) => defaults({ thunk: false }).concat(sagaMiddleware),
});

export function runSagas() {
  sagaMiddleware.run(rootSaga);
}
