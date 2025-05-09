import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  FollowUser = 'user-follows/follow-user',
  UnfollowUser = 'user-follows/unfollow-user',
  GetFollowStatus = 'user-follows/get-follow-status',
}

export interface UserFollowsState {
  following: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserFollowsState = {
  following: [],
  isLoading: false,
  error: null,
};

export const followUser = createAction<{ followingId: string }>(SagaActionTypes.FollowUser);
export const unfollowUser = createAction<{ followingId: string }>(SagaActionTypes.UnfollowUser);
export const getFollowStatus = createAction<{ followingId: string }>(SagaActionTypes.GetFollowStatus);

const slice = createSlice({
  name: 'userFollows',
  initialState,
  reducers: {
    setFollowing: (state, action: PayloadAction<string[]>) => {
      state.following = action.payload;
    },
    addFollowing: (state, action: PayloadAction<string>) => {
      if (!state.following.includes(action.payload)) {
        state.following.push(action.payload);
      }
    },
    removeFollowing: (state, action: PayloadAction<string>) => {
      state.following = state.following.filter((id) => id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setFollowing, addFollowing, removeFollowing, setLoading, setError } = slice.actions;

export const reducer = slice.reducer;
