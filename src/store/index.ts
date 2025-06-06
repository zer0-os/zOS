import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import { rootSaga } from './saga';
import { rootReducer } from './reducer';

const sagaMiddleware = createSagaMiddleware({
  onError: (e, info) => {
    console.error('Encountered uncaught error in root saga: ', e);
    console.error('Saga info: ', info);
  },
});

export const store = setupStore();

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (defaults) => defaults({ thunk: false }).concat(sagaMiddleware),
    preloadedState,
    devTools: process.env.NODE_ENV !== 'production',
  });
}

export function runSagas() {
  sagaMiddleware.run(rootSaga);
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
