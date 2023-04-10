import { createNormalizedSlice, remove } from '../normalized';

const slice = createNormalizedSlice({
  name: 'users',
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;

export { remove };
