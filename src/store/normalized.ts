import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

export const { receive, remove } = slice.actions;
export const { reducer } = slice;
