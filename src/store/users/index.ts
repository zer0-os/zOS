import { createNormalizedSlice, removeAll } from '../normalized';

const slice = createNormalizedSlice({
  name: 'users',
  options: {
    idAttribute: 'userId',
  },
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;

export { removeAll };
