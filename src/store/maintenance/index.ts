import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export const SagaActionTypes = {
  CheckServerStatus: 'maintenance/checkServerStatus',
};

export const checkServerStatus = createAction(SagaActionTypes.CheckServerStatus);

export interface MaintenanceState {
  isInMaintenance: boolean;
}

const initialState: MaintenanceState = {
  isInMaintenance: false,
};

export const slice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    setMaintenanceStatus: (state, action: PayloadAction<boolean>) => {
      state.isInMaintenance = action.payload;
    },
  },
});

export const { setMaintenanceStatus } = slice.actions;
export const { reducer } = slice;

export const selectIsInMaintenance = (state: { maintenance: MaintenanceState }) => state.maintenance.isInMaintenance;
