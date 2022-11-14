import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ViewModes } from '../../shared-components/theme-engine';

export enum SagaActionTypes {
  SaveViewMode = 'theme/saga/saveViewMode',
}

const setViewMode = createAction<ViewModes>(SagaActionTypes.SaveViewMode);

export interface ThemeState {
  value: { viewMode: ViewModes };
}

const initialState: ThemeState = {
  value: { viewMode: ViewModes.Dark },
};

const slice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    receive: (state, action: PayloadAction<ViewModes>) => {
      state.value = { viewMode: action.payload };
    },
  },
});

export const { receive } = slice.actions;
export const { reducer } = slice;
export { setViewMode };
