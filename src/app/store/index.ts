import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../../features/counter/counterSlice';

import { reducer as feed } from './feed';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    feed,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
