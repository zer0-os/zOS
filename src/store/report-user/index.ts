import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  ReportUser = 'reportUser/reportUser',
  OpenReportUserModal = 'reportUser/openReportUserModal',
  CloseReportUserModal = 'reportUser/closeReportUserModal',
}

export interface ReportUserPayload {
  // note: reportedUserId is not included in the payload as it is set in the reducer when the modal is opened
  reason: string;
  comment?: string;
}

export type ReportUserState = {
  loading: boolean;
  errorMessage: string;
  successMessage: string;
  reportedUserId: string;
  isReportUserModalOpen: boolean;
};

export const initialState: ReportUserState = {
  loading: false,
  errorMessage: '',
  successMessage: '',
  reportedUserId: '',
  isReportUserModalOpen: false,
};

export const reportUser = createAction<ReportUserPayload>(SagaActionTypes.ReportUser);
export const openReportUserModal = createAction<{ reportedUserId: string }>(SagaActionTypes.OpenReportUserModal);
export const closeReportUserModal = createAction(SagaActionTypes.CloseReportUserModal);

const slice = createSlice({
  name: 'reportUser',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<ReportUserState['loading']>) => {
      state.loading = action.payload;
    },
    setErrorMessage: (state, action: PayloadAction<ReportUserState['errorMessage']>) => {
      state.errorMessage = action.payload;
    },
    setSuccessMessage: (state, action: PayloadAction<ReportUserState['successMessage']>) => {
      state.successMessage = action.payload;
    },
    setReportedUserId: (state, action: PayloadAction<ReportUserState['reportedUserId']>) => {
      state.reportedUserId = action.payload;
    },
    setIsReportUserModalOpen: (state, action: PayloadAction<ReportUserState['isReportUserModalOpen']>) => {
      state.isReportUserModalOpen = action.payload;
    },
  },
});

export const { setLoading, setErrorMessage, setSuccessMessage, setReportedUserId, setIsReportUserModalOpen } =
  slice.actions;
export const { reducer } = slice;
