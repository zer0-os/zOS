import { Slice, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { schema as nSchema } from 'normalizr';

import { Normalizer } from './normalizer';

import { AsyncNormalizedListState, AsyncListStatus, NormalizedListSliceConfig, NormalizedSliceConfig } from '.';

export class Creators {
  static bind(slice) {
    return new Creators(slice);
  }

  constructor(private normalizedSlice) {}

  public createNormalizedListSlice = (config: NormalizedListSliceConfig) => {
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
      denormalize: normalizer.denormalize,
    };
  };

  public createNormalizedSlice = (config: NormalizedSliceConfig) => {
    const { receive } = this.normalizedSlice.actions;

    const schema = new nSchema.Entity(config.name);

    const normalizer = new Normalizer(schema);

    return {
      normalize: normalizer.normalize,
      schema,
      actions: { receiveNormalized: receive },
    };
  };
}
