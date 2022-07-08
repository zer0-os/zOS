import { createNormalizedSlice } from '../normalized';

export interface Channel {
  id: string;
  name: string;
}

const slice = createNormalizedSlice({
  name: 'channels',
});

export const { receiveNormalized } = slice.actions;
export const { normalize, denormalize, schema } = slice;
