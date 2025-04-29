import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DialogState = {
  deleteMessageId: string;
  lightbox: {
    isOpen: boolean;
    media: any[];
    startingIndex: number;
    hasActions?: boolean;
  };
};

export const initialState: DialogState = {
  deleteMessageId: null,
  lightbox: {
    isOpen: false,
    media: [],
    startingIndex: 0,
    hasActions: true,
  },
};

const slice = createSlice({
  name: 'dialog',
  initialState,
  reducers: {
    openDeleteMessage: (state, action: PayloadAction<string>) => {
      state.deleteMessageId = action.payload;
    },
    closeDeleteMessage: (state) => {
      state.deleteMessageId = null;
    },
    openLightbox: (state, action: PayloadAction<{ media: any[]; startingIndex: number; hasActions?: boolean }>) => {
      state.lightbox = {
        isOpen: true,
        media: action.payload.media,
        startingIndex: action.payload.startingIndex,
        hasActions: action.payload.hasActions,
      };
    },
    closeLightbox: (state) => {
      state.lightbox = initialState.lightbox;
    },
  },
});

export const { openDeleteMessage, closeDeleteMessage, openLightbox, closeLightbox } = slice.actions;
export const { reducer } = slice;
