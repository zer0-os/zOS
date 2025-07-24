import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  TotalRewardsViewed = 'rewards/totalRewardsViewed',
  CloseRewardsTooltip = 'registration/closeRewardsTooltip',
  TransferMeow = 'rewards/transferMeow',
  RefreshRewards = 'rewards/refreshRewards',
}

export type RewardsState = {
  loading: boolean;
  meow: string;
  meowInUSD: number;
  meowPercentChange: number;
  meowPreviousDay: string;
  showRewardsInTooltip: boolean;
  showRewardsInPopup: boolean;
  showNewRewardsIndicator: boolean;
  transferLoading: boolean;
  transferError?: string;
  legacyRewards: string;
  totalDailyRewards: string;
  totalReferralFees: string;
  unclaimedRewards: string;
};

export const initialState: RewardsState = {
  loading: false,
  meow: '0',
  meowInUSD: 0.0,
  meowPercentChange: 0.0,
  meowPreviousDay: '0',
  showRewardsInTooltip: false,
  showRewardsInPopup: false,
  showNewRewardsIndicator: false,
  transferLoading: false,
  transferError: null,
  legacyRewards: '0',
  totalDailyRewards: '0',
  totalReferralFees: '0',
  unclaimedRewards: '0',
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
export const refreshRewards = createAction(SagaActionTypes.RefreshRewards);

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
    setMeowPercentChange: (state, action: PayloadAction<RewardsState['meowPercentChange']>) => {
      state.meowPercentChange = action.payload;
    },
    setMeowPreviousDay: (state, action: PayloadAction<RewardsState['meowPreviousDay']>) => {
      state.meowPreviousDay = action.payload;
    },
    setLegacyRewards: (state, action: PayloadAction<RewardsState['legacyRewards']>) => {
      state.legacyRewards = action.payload;
    },
    setTotalDailyRewards: (state, action: PayloadAction<RewardsState['totalDailyRewards']>) => {
      state.totalDailyRewards = action.payload;
    },
    setTotalReferralFees: (state, action: PayloadAction<RewardsState['totalReferralFees']>) => {
      state.totalReferralFees = action.payload;
    },
    setUnclaimedRewards: (state, action: PayloadAction<RewardsState['unclaimedRewards']>) => {
      state.unclaimedRewards = action.payload;
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
  setMeowPercentChange,
  setMeowPreviousDay,
  setMeowInUSD,
  setShowRewardsInTooltip,
  setShowRewardsInPopup,
  setShowNewRewardsIndicator,
  setTransferError,
  setTransferLoading,
  setTotalDailyRewards,
  setTotalReferralFees,
  setUnclaimedRewards,
  setLegacyRewards,
} = slice.actions;
export const { reducer } = slice;
