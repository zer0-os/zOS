import { createNormalizedSlice } from '../normalized';

export interface Message {
  id: string;
  name: string;
}

const slice = createNormalizedSlice({
  name: 'messages',
});

export const { receiveNormalized } = slice.actions;
export const { normalize, denormalize, schema } = slice;
