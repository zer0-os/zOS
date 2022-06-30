import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { schema as nSchema, normalize as nNormalize, Schema } from 'normalizr';

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
    receive: (state, action: PayloadAction<any>) => {
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
    },
  },
});

class Normalizer {
  private _schema: nSchema.Entity;
  private _listSchema: Schema;

  constructor(schema: nSchema.Entity) {
    this._schema = schema;
    this._listSchema = [schema];
  }

  public normalize = (item) => {
    if (Array.isArray(item)) {
      return this.normalizeMany(item);
    }

    return this.normalizeSingle(item);
  };

  private normalizeMany(items) {
    // this.throwIfInvalid(items); XXX
    return nNormalize(items, this._listSchema);
  }

  private normalizeSingle(item) {
    // this.throwIfInvalid([item]); XXX
    return nNormalize(item, this._schema);
  }
}

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

export function createNormalizedListSlice(config: NormalizedListSliceConfig) {
  const initialState: AsyncNormalizedListState = {
    status: AsyncListStatus.Idle,
    value: [],
  };

  const normalizer = new Normalizer(config.schema);

  const listSlice = createSlice({
    name: config.name,
    initialState,
    reducers: {
      receiveNormalized: (state, action: PayloadAction<string[]>) => {
        state.value = action.payload;
      },
      setStatus: (state, action: PayloadAction<AsyncListStatus>) => {
        state.status = action.payload;
      },
    },
  });

  return {
    actions: {
      ...listSlice.actions,
    },
    reducer: listSlice.reducer,
    normalize: normalizer.normalize,
  };
}

export function createNormalizedSlice(config: NormalizedSliceConfig) {
  const { receive } = slice.actions;

  const schema = new nSchema.Entity(config.name);

  const normalizer = new Normalizer(schema);

  return {
    normalize: normalizer.normalize,
    schema,
    actions: { receiveNormalized: receive },
  };
}

export const { receive, remove } = slice.actions;
export const { reducer } = slice;
