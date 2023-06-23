import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  Fetch = 'rewards/fetch',
  RewardsPopupClosed = 'registration/rewardsPopupClosed',
}

export type RewardsState = {
  loading: boolean;
  zero: string;
  zeroPreviousDay: string;
  showNewRewards: boolean;
};

export const initialState: RewardsState = {
  loading: false,
  zero: '0',
  zeroPreviousDay: '0',
  showNewRewards: false,
};

export const fetch = createAction<{}>(SagaActionTypes.Fetch);
export const rewardsPopupClosed = createAction(SagaActionTypes.RewardsPopupClosed);

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
    setShowNewRewards: (state, action: PayloadAction<RewardsState['showNewRewards']>) => {
      state.showNewRewards = action.payload;
    },
  },
});

export const { setLoading, setZero, setZeroPreviousDay, setShowNewRewards } = slice.actions;
export const { reducer } = slice;
