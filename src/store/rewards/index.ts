import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  Fetch = 'rewards/fetch',
}

export type RewardsState = {
  loading: boolean;
  zero: string;
  zeroPreviousDay: string;
};

export const initialState: RewardsState = {
  loading: false,
  zero: '0',
  zeroPreviousDay: '0',
};

export const fetch = createAction<{}>(SagaActionTypes.Fetch);

const slice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<RewardsState['loading']>) => {
      state.loading = action.payload;
    },
    setZero: (state, action: PayloadAction<RewardsState['zero']>) => {
      state.zero = action.payload;
    },
    setZeroPreviousDay: (state, action: PayloadAction<RewardsState['zeroPreviousDay']>) => {
      state.zeroPreviousDay = action.payload;
    },
  },
});

export const { setLoading, setZero, setZeroPreviousDay } = slice.actions;
export const { reducer } = slice;
