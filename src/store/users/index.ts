import { createNormalizedSlice, removeAll } from '../normalized';
import { createAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  SearchResults = 'users/searchResults',
}

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

export const receiveSearchResults = createAction<SearchResult[]>(SagaActionTypes.SearchResults);

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;

export { removeAll };
