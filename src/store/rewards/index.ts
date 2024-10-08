import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  TotalRewardsViewed = 'rewards/totalRewardsViewed',
  CloseRewardsTooltip = 'registration/closeRewardsTooltip',
  TransferMeow = 'rewards/transferMeow',
}

export type RewardsState = {
  loading: boolean;
  meow: string;
  meowInUSD: number;
  meowPreviousDay: string;
  showRewardsInTooltip: boolean;
  showRewardsInPopup: boolean;
  showNewRewardsIndicator: boolean;
  transferLoading: boolean;
  transferError?: string;
};

export const initialState: RewardsState = {
  loading: false,
  meow: '0',
  meowInUSD: 0.0,
  meowPreviousDay: '0',
  showRewardsInTooltip: false,
  showRewardsInPopup: false,
  showNewRewardsIndicator: false,
  transferLoading: false,
  transferError: null,
};

export const totalRewardsViewed = createAction(SagaActionTypes.TotalRewardsViewed);
export const closeRewardsTooltip = createAction(SagaActionTypes.CloseRewardsTooltip);
export const transferMeow = createAction<{
  meowSenderId: string;
  postOwnerId: string;
  postMessageId: string;
  meowAmount: string;
  roomId: string;
}>(SagaActionTypes.TransferMeow);

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
    setShowNewRewardsIndicator: (state, action: PayloadAction<RewardsState['showNewRewardsIndicator']>) => {
      state.showNewRewardsIndicator = action.payload;
    },
    setTransferError: (state, action: PayloadAction<{ error: string }>) => {
      state.transferError = action.payload.error;
    },
    setTransferLoading: (state, action: PayloadAction<RewardsState['transferLoading']>) => {
      state.transferLoading = action.payload;
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
  setShowNewRewardsIndicator,
  setTransferError,
  setTransferLoading,
} = slice.actions;
export const { reducer } = slice;
