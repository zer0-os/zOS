import { createSlice } from '@reduxjs/toolkit';

export enum SagaActionTypes {}

export type ThirdwebState = {};
export const initialState: ThirdwebState = {};

const slice = createSlice({
  name: 'thirdweb',
  initialState,
  reducers: {},
});

export const { reducer } = slice;
