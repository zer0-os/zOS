import { createNormalizedSlice } from '../normalized';

const slice = createNormalizedSlice({
  name: 'channels',
});

export const { receiveNormalized } = slice.actions;
export const { normalize, schema } = slice;
