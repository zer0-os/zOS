import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DialogState = {
  deleteMessageId: number;
};

export const initialState: DialogState = {
  deleteMessageId: null,
};

const slice = createSlice({
  name: 'dialog',
  initialState,
  reducers: {
    openDeleteMessage: (state, action: PayloadAction<number>) => {
      state.deleteMessageId = action.payload;
    },
    closeDeleteMessage: (state) => {
      state.deleteMessageId = null;
    },
  },
});

export const { openDeleteMessage, closeDeleteMessage } = slice.actions;
export const { reducer } = slice;
