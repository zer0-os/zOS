import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  GetBackup = 'chat/get-backup',
  GenerateBackup = 'chat/generate-backup',
  SaveBackup = 'chat/save-backup',
  RestoreBackup = 'chat/restore-backup',
  ClearBackup = 'chat/clear-backup',
}

export type MatrixState = {
  isLoaded: boolean;
  trustInfo: { trustedLocally: boolean; usable: boolean } | null;
  backup: any | null;
  successMessage: string;
  errorMessage: string;
};

export const initialState: MatrixState = {
  isLoaded: false,
  trustInfo: null,
  backup: null,
  successMessage: '',
  errorMessage: '',
};

export const getBackup = createAction(SagaActionTypes.GetBackup);
export const generateBackup = createAction(SagaActionTypes.GenerateBackup);
export const saveBackup = createAction(SagaActionTypes.SaveBackup);
export const restoreBackup = createAction<string>(SagaActionTypes.RestoreBackup);
export const clearBackup = createAction(SagaActionTypes.ClearBackup);

const slice = createSlice({
  name: 'matrix',
  initialState,
  reducers: {
    setLoaded: (state, action: PayloadAction<MatrixState['isLoaded']>) => {
      state.isLoaded = action.payload;
    },
    setBackup: (state, action: PayloadAction<MatrixState['backup']>) => {
      state.backup = action.payload;
    },
    setTrustInfo: (state, action: PayloadAction<MatrixState['trustInfo']>) => {
      state.trustInfo = action.payload;
    },
    setSuccessMessage: (state, action: PayloadAction<MatrixState['successMessage']>) => {
      state.successMessage = action.payload;
    },
    setErrorMessage: (state, action: PayloadAction<MatrixState['errorMessage']>) => {
      state.errorMessage = action.payload;
    },
  },
});

export const { setLoaded, setBackup, setTrustInfo, setSuccessMessage, setErrorMessage } = slice.actions;
export const { reducer } = slice;
