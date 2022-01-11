import { configureStore } from '@reduxjs/toolkit';

import { reducer as zns } from './zns';

export const store = configureStore({
  reducer: {
    zns,
  },
  middleware: (defaults) => defaults({ thunk: false }),
});

export type RootState = ReturnType<typeof store.getState>;
