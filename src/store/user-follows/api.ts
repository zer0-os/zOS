import { get, post, del } from '../../lib/api/rest';

export interface FollowResponse {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface UserFollowDetails {
  userId: string;
  firstName: string;
  profileImage: string;
  primaryZID: string;
  wallets: {
    primaryWalletAddress: string;
    thirdWebWalletAddress?: string;
  };
}

export interface PaginatedResponse<T> {
  users: T[];
  nextPage: number | null;
  total: number;
}

export interface ErrorResponse {
  error: string;
  reason: string;
}

export enum FollowError {
  CANNOT_FOLLOW_SELF = 'CANNOT_FOLLOW_SELF',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ALREADY_FOLLOWING = 'ALREADY_FOLLOWING',
  NOT_FOLLOWING = 'NOT_FOLLOWING',
  FAILED_TO_FOLLOW = 'FAILED_TO_FOLLOW',
  FAILED_TO_UNFOLLOW = 'FAILED_TO_UNFOLLOW',
}

export const followUser = async (followingId: string): Promise<FollowResponse> => {
  try {
    const response = await post<FollowResponse>(`/api/v2/user-follows/${followingId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.reason || FollowError.FAILED_TO_FOLLOW);
    }
    throw error;
  }
};

export const unfollowUser = async (followingId: string): Promise<void> => {
  try {
    await del(`/api/v2/user-follows/${followingId}`);
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.reason || FollowError.FAILED_TO_UNFOLLOW);
    }
    throw error;
  }
};

export const getFollowStatus = async (followingId: string): Promise<boolean> => {
  try {
    const response = await get<{ isFollowing: boolean }>(`/api/v2/user-follows/${followingId}/status`);
    return response.body.isFollowing;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.reason);
    }
    throw error;
  }
};

/**
 * Note: Follow counts are also available in the user profile data
 * through the user_profile_view. These count endpoints are still
 * useful for real-time updates after follow/unfollow actions.
 */
export const getFollowingCount = async (userId: string): Promise<number> => {
  try {
    const response = await get<{ count: number }>(`/api/v2/user-follows/${userId}/following/count`);
    return response.data.count;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.reason);
    }
    throw error;
  }
};

export const getFollowersCount = async (userId: string): Promise<number> => {
  try {
    const response = await get<{ count: number }>(`/api/v2/user-follows/${userId}/followers/count`);
    return response.data.count;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.reason);
    }
    throw error;
  }
};

export const getFollowers = async (
  userId: string,
  page = 1,
  limit = 50
): Promise<PaginatedResponse<UserFollowDetails>> => {
  try {
    const response = await get<PaginatedResponse<UserFollowDetails>>(`/api/v2/user-follows/${userId}/followers`, {
      params: { page, limit },
    });
    return response.body;
  } catch (error: any) {
    if (error.response?.data?.reason) {
      throw new Error(error.response.data.reason);
    }
    throw new Error('Failed to fetch followers');
  }
};

export const getFollowing = async (
  userId: string,
  page = 1,
  limit = 50
): Promise<PaginatedResponse<UserFollowDetails>> => {
  try {
    const response = await get<PaginatedResponse<UserFollowDetails>>(`/api/v2/user-follows/${userId}/following`, {
      params: { page, limit },
    });
    return response.body;
  } catch (error: any) {
    if (error.response?.data?.reason) {
      throw new Error(error.response.data.reason);
    }
    throw new Error('Failed to fetch following users');
  }
};
