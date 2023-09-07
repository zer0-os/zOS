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
  showRewardsInTooltip: boolean;
  showRewardsInPopup: boolean;
};

export const initialState: RewardsState = {
  loading: false,
  zero: '0',
  zeroInUSD: 0.0,
  zeroPreviousDay: '0',
  showRewardsInTooltip: false,
  showRewardsInPopup: false,
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
    setShowRewardsInTooltip: (state, action: PayloadAction<RewardsState['showRewardsInTooltip']>) => {
      state.showRewardsInTooltip = action.payload;
    },
    setShowRewardsInPopup: (state, action: PayloadAction<RewardsState['showRewardsInPopup']>) => {
      state.showRewardsInPopup = action.payload;
    },
  },
});

export const { setLoading, setZero, setZeroPreviousDay, setZeroInUSD, setShowRewardsInTooltip, setShowRewardsInPopup } =
  slice.actions;
export const { reducer } = slice;
