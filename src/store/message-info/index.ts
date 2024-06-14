import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';

export enum Stage {
  None = 'none',
  Overview = 'overview',
}

export enum SagaActionTypes {
  OpenMessageInfo = 'message-info/open-message-info',
  CloseMessageInfo = 'message-info/close-message-info',
}

export const openMessageInfo = createAction<{ messageId: number }>(SagaActionTypes.OpenMessageInfo);
export const closeMessageInfo = createAction(SagaActionTypes.CloseMessageInfo);

export type MessageInfoState = {
  stage: Stage;
  selectedMessageId: string;
};

export const initialState: MessageInfoState = {
  stage: Stage.None,
  selectedMessageId: '',
};

const slice = createSlice({
  name: 'message-info',
  initialState,
  reducers: {
    setStage: (state, action: PayloadAction<Stage>) => {
      state.stage = action.payload;
    },
    setSelectedMessageId: (state, action: PayloadAction<string>) => {
      state.selectedMessageId = action.payload;
    },
  },
});

export const { setSelectedMessageId, setStage } = slice.actions;
export const { reducer } = slice;
