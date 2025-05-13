import { createNormalizedSlice, removeAll } from '../normalized';

export interface SearchResult {
  id: string;
  name: string;
  profileImage: string;
  primaryZID: string;
}

const slice = createNormalizedSlice({
  name: 'users',
  options: {
    idAttribute: 'userId',
  },
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;

export { removeAll };
