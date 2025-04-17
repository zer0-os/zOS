import { AnyAction, createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { schema as nSchema, Schema } from 'normalizr';
import { Creators } from './creators';

const RECEIVE_PREFIX = 'normalized/receive/nested/entities';

export enum AsyncListStatus {
  Idle = 'idle',
  Fetching = 'fetching',
  Stopped = 'stopped',
}

export interface AsyncNormalizedListState {
  status: AsyncListStatus;
  value: string[];
}

export interface NormalizedListSliceConfig {
  name: string;
  schema: nSchema.Entity;
}

export interface SchemaOptions {
  idAttribute: string;
}

export interface NormalizedSliceConfig {
  name: string;
  schemaDefinition?: Schema;
  options?: SchemaOptions;
}

const receiveNormalized = (state, action: PayloadAction<any>) => {
  const tableNames = Object.keys(action.payload);
  const newState = { ...state };

  // Merge each table's entities into the existing state
  for (const tableName of tableNames) {
    const newTableState = action.payload[tableName];
    const existingTableState = state[tableName] || {};
    const mergedTableState = { ...existingTableState };

    // Merge each individual entity in the table
    for (const entityId of Object.keys(newTableState)) {
      mergedTableState[entityId] = {
        ...existingTableState[entityId],
        ...newTableState[entityId],
      };
    }

    newState[tableName] = mergedTableState;
  }

  return newState;
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
    removeAll: (state, action: PayloadAction<{ schema: string }>) => {
      const { schema } = action.payload;

      return { ...state, [schema]: {} };
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
export const createNormalizedReceiveAction = (name: string, normalizeFunction) => {
  return createAction(`${RECEIVE_PREFIX}/${name}`, (items) => ({
    payload: normalizeFunction(items),
  }));
};

export const { receive, remove, removeAll } = slice.actions;
export const { reducer } = slice;
