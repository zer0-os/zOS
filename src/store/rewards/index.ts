import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  Fetch = 'rewards/fetch',
}

export type RewardsState = {
  loading: boolean;
  total: number;
};

export const initialState: RewardsState = {
  loading: false,
  total: 0,
};

export const fetch = createAction<{}>(SagaActionTypes.Fetch);

const slice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<RewardsState['loading']>) => {
      state.loading = action.payload;
    },
    setTotal: (state, action: PayloadAction<RewardsState['total']>) => {
      state.total = action.payload;
    },
  },
});

export const { setLoading, setTotal } = slice.actions;
export const { reducer } = slice;
