import { useInfiniteQuery } from '@tanstack/react-query';
import { getFollowers, getFollowing, UserFollowDetails } from '../../../store/user-follows/api';
import { User } from '../../../store/channels';
import { Wallet } from '../../../store/authentication/types';
import { getUserSubHandle } from '../../../lib/user';

const transformUser = (user: UserFollowDetails): Omit<User, 'wallets'> & { wallets: Wallet[] } => {
  const wallets: Wallet[] = [
    {
      id: user.userId,
      publicAddress: user.wallets.primaryWalletAddress,
      isThirdWeb: false,
      walletType: 'external',
    },
  ];

  if (user.wallets.thirdWebWalletAddress) {
    wallets.push({
      id: user.userId,
      publicAddress: user.wallets.thirdWebWalletAddress,
      isThirdWeb: true,
      walletType: 'EIP4337',
    });
  }

  return {
    userId: user.userId,
    matrixId: '',
    firstName: user.firstName,
    lastName: '',
    profileId: '',
    isOnline: false,
    profileImage: user.profileImage,
    lastSeenAt: '',
    primaryZID: user.primaryZID,
    displaySubHandle: getUserSubHandle(user.primaryZID, user.wallets.primaryWalletAddress),
    wallets,
  };
};

export const useFollowList = (userId: string, type: 'followers' | 'following') => {
  const { data, isLoading, error, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['followList', userId, type],
    queryFn: async ({ pageParam = 1 }) => {
      const response =
        type === 'followers'
          ? await getFollowers(userId, pageParam as number)
          : await getFollowing(userId, pageParam as number);

      return {
        users: response.users.map(transformUser),
        nextPage: response.nextPage,
        total: response.total,
      };
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage ?? undefined,
    initialPageParam: 1,
    enabled: !!userId,
  });

  const users = data?.pages?.flatMap((page) => page?.users ?? []) ?? [];
  const total = data?.pages?.[0]?.total ?? 0;

  return {
    users,
    total,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  };
};
