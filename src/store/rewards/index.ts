import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  Fetch = 'rewards/fetch',
  RewardsPopupClosed = 'registration/rewardsPopupClosed',
  RewardsTooltipClosed = 'registration/rewardsTooltipClosed',
}

export type RewardsState = {
  loading: boolean;
  zero: string;
  zeroInUSD: number;
  zeroPreviousDay: string;
  showRewardsTooltip: boolean;
  showRewardsModal: boolean;
};

export const initialState: RewardsState = {
  loading: false,
  zero: '0',
  zeroInUSD: 0.0,
  zeroPreviousDay: '0',
  showRewardsTooltip: false,
  showRewardsModal: false,
};

export const fetch = createAction<{}>(SagaActionTypes.Fetch);
export const rewardsPopupClosed = createAction(SagaActionTypes.RewardsPopupClosed);
export const rewardsTooltipClosed = createAction(SagaActionTypes.RewardsTooltipClosed);

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
    setZeroInUSD: (state, action: PayloadAction<RewardsState['zeroInUSD']>) => {
      state.zeroInUSD = action.payload;
    },
    setZeroPreviousDay: (state, action: PayloadAction<RewardsState['zeroPreviousDay']>) => {
      state.zeroPreviousDay = action.payload;
    },
    setShowRewardsTooltip: (state, action: PayloadAction<RewardsState['showRewardsTooltip']>) => {
      state.showRewardsTooltip = action.payload;
    },
    setShowRewardsModal: (state, action: PayloadAction<RewardsState['showRewardsModal']>) => {
      state.showRewardsModal = action.payload;
    },
  },
});

export const { setLoading, setZero, setZeroPreviousDay, setZeroInUSD, setShowRewardsTooltip, setShowRewardsModal } =
  slice.actions;
export const { reducer } = slice;
