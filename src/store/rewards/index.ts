import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  RewardsPopupClosed = 'registration/rewardsPopupClosed',
  RewardsTooltipClosed = 'registration/rewardsTooltipClosed',
}

export type RewardsState = {
  loading: boolean;
  meow: string;
  meowInUSD: number;
  meowPreviousDay: string;
  showRewardsInTooltip: boolean;
  showRewardsInPopup: boolean;
};

export const initialState: RewardsState = {
  loading: false,
  meow: '0',
  meowInUSD: 0.0,
  meowPreviousDay: '0',
  showRewardsInTooltip: false,
  showRewardsInPopup: false,
};

export const rewardsPopupClosed = createAction(SagaActionTypes.RewardsPopupClosed);
export const rewardsTooltipClosed = createAction(SagaActionTypes.RewardsTooltipClosed);

const slice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<RewardsState['loading']>) => {
      state.loading = action.payload;
    },
    setMeow: (state, action: PayloadAction<RewardsState['meow']>) => {
      state.meow = action.payload;
    },
    setMeowInUSD: (state, action: PayloadAction<RewardsState['meowInUSD']>) => {
      state.meowInUSD = action.payload;
    },
    setMeowPreviousDay: (state, action: PayloadAction<RewardsState['meowPreviousDay']>) => {
      state.meowPreviousDay = action.payload;
    },
    setShowRewardsInTooltip: (state, action: PayloadAction<RewardsState['showRewardsInTooltip']>) => {
      state.showRewardsInTooltip = action.payload;
    },
    setShowRewardsInPopup: (state, action: PayloadAction<RewardsState['showRewardsInPopup']>) => {
      state.showRewardsInPopup = action.payload;
    },
    openRewardsDialog: (state) => {
      state.showRewardsInPopup = true;
    },
    closeRewardsDialog: (state) => {
      state.showRewardsInPopup = false;
    },
  },
});

export const {
  closeRewardsDialog,
  openRewardsDialog,
  setLoading,
  setMeow,
  setMeowPreviousDay,
  setMeowInUSD,
  setShowRewardsInTooltip,
  setShowRewardsInPopup,
} = slice.actions;
export const { reducer } = slice;
