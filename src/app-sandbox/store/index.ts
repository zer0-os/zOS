import { configureStore } from '@reduxjs/toolkit';

import { reducer as zns } from './zns';
import { reducer as web3 } from './web3';

export const store = configureStore({
  reducer: {
    zns,
    web3,
  },
  middleware: (defaults) => defaults({ thunk: false }),
});

export const { dispatch } = store;
export type RootState = ReturnType<typeof store.getState>;
