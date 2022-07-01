import { AnyAction, createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { schema as nSchema } from 'normalizr';
import { Creators } from './creators';

export enum AsyncListStatus {
  Idle = 'idle',
  Fetching = 'fetching',
}

export interface AsyncNormalizedListState {
  status: AsyncListStatus;
  value: string[];
}

export interface NormalizedListSliceConfig {
  name: string;
  schema: nSchema.Entity;
}

export interface NormalizedSliceConfig {
  name: string;
}

const RECEIVE_PREFIX = 'normalized/receive/nested/entities';
export const createNormalizedReceiveAction = (name: string, normalizeFunction) => {
  return createAction(`${RECEIVE_PREFIX}/${name}`, (items) => ({
    payload: normalizeFunction(items),
  }));
};

const receiveNormalized = (state, action: PayloadAction<any>) => {
  const tableNames = Object.keys(action.payload);
  const newState = {};

  for (const tableName of tableNames) {
    const newTableState = action.payload[tableName];
    const existingTableState = state[tableName] || {};

    Object.keys(existingTableState).forEach((id) => {
      const item = newTableState[id] || {};
      newTableState[id] = { ...state[tableName][id], ...item };
    });

    newState[tableName] = newTableState;
  }

  return {
    ...state,
    ...newState,
  };
};

const slice = createSlice({
  name: 'normalized',
  initialState: {},
  reducers: {
    remove: (state, action: PayloadAction<{ schema: string; id: string }>) => {
      const { schema, id } = action.payload;
      const newNormalizedState = { ...state[schema] };

      delete newNormalizedState[id];

      return { ...state, [schema]: newNormalizedState };
    },
    receive: receiveNormalized,
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action: AnyAction) => action.type.startsWith(RECEIVE_PREFIX),
      (state: any, action) =>
        receiveNormalized(state, {
          ...action,
          payload: action.payload.entities,
        })
    );
  },
});

const creators = Creators.bind(slice);

export const createNormalizedSlice = creators.createNormalizedSlice;
export const createNormalizedListSlice = creators.createNormalizedListSlice;

export const { receive, remove } = slice.actions;
export const { reducer } = slice;
