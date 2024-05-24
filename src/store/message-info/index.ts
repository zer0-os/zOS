import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  OpenMessageInfo = 'message-info/open-message-info',
  CloseMessageInfo = 'message-info/close-message-info',
}

export const openMessageInfo = createAction<{ roomId: string; messageId: number }>(SagaActionTypes.OpenMessageInfo);
export const closeMessageInfo = createAction(SagaActionTypes.CloseMessageInfo);

export type MessageInfoState = {
  selectedMessageId: string;
};

export const initialState: MessageInfoState = {
  selectedMessageId: '',
};

const slice = createSlice({
  name: 'message-info',
  initialState,
  reducers: {
    setSelectedMessageId: (state, action: PayloadAction<string>) => {
      state.selectedMessageId = action.payload;
    },
  },
});

export const { setSelectedMessageId } = slice.actions;
export const { reducer } = slice;
