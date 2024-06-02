import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  SetMainBackground = 'background/setMainBackground',
}

export enum MainBackground {
  StaticGreenParticles = 'static-green-particles',
  AnimatedGreenParticles = 'animated-green-particles',
  AnimatedBlackParticles = 'animated-black-particles',
}

export const setMainBackground = createAction<{ selectedBackground: MainBackground }>(
  SagaActionTypes.SetMainBackground
);

export interface BackgroundState {
  selectedMainBackground: MainBackground;
}

const initialState: BackgroundState = {
  selectedMainBackground:
    (localStorage.getItem('mainBackground:selectedMainBackground') as MainBackground) ||
    MainBackground.StaticGreenParticles,
};

const slice = createSlice({
  name: 'background',
  initialState,
  reducers: {
    setSelectedMainBackground: (state, action: PayloadAction<BackgroundState['selectedMainBackground']>) => {
      state.selectedMainBackground = action.payload;
    },
  },
});

export const { reducer } = slice;
export const { setSelectedMainBackground } = slice.actions;
