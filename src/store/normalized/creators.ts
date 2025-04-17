import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { schema as nSchema } from 'normalizr';
import { Normalizer } from './normalizer';
import {
  AsyncNormalizedListState,
  AsyncListStatus,
  NormalizedListSliceConfig,
  NormalizedSliceConfig,
  createNormalizedReceiveAction,
} from '.';

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

    const receive = createNormalizedReceiveAction(config.name, normalizer.normalize);

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
      extraReducers: (builder) => {
        builder.addCase(receive, (state, action) => {
          const { result } = action.payload;

          state.value = Array.isArray(result) ? result : [result];
        });
      },
    });

    return {
      actions: {
        ...listSlice.actions,
        receive,
      },
      reducer: listSlice.reducer,
      normalize: normalizer.normalize,
      denormalize: normalizer.denormalize,
    };
  };

  public createNormalizedSlice = (config: NormalizedSliceConfig) => {
    const { receive: receiveNormalized } = this.normalizedSlice.actions;

    const schema = new nSchema.Entity(config.name, config.schemaDefinition, config.options ?? {});

    const normalizer = new Normalizer(schema);

    return {
      normalize: normalizer.normalize,
      denormalize: normalizer.denormalize,
      schema,
      actions: {
        receiveNormalized,
        receive: (data) => {
          const normalized = normalizer.normalize(data);

          return receiveNormalized(normalized.entities);
        },
      },
    };
  };
}
