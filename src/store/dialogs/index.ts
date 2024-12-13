import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DialogState = {
  deleteMessageId: number;
  lightbox: {
    isOpen: boolean;
    media: any[];
    startingIndex: number;
  };
};

export const initialState: DialogState = {
  deleteMessageId: null,
  lightbox: {
    isOpen: false,
    media: [],
    startingIndex: 0,
  },
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
    openLightbox: (state, action: PayloadAction<{ media: any[]; startingIndex: number }>) => {
      state.lightbox = {
        isOpen: true,
        media: action.payload.media,
        startingIndex: action.payload.startingIndex,
      };
    },
    closeLightbox: (state) => {
      state.lightbox = initialState.lightbox;
    },
  },
});

export const { openDeleteMessage, closeDeleteMessage, openLightbox, closeLightbox } = slice.actions;
export const { reducer } = slice;
