import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { ethers } from 'ethers';
import { currentUserSelector } from '../../../store/authentication/selectors';
import { ProfileData } from './types';
import { get } from '../../../lib/api/rest';

export interface UseProfileParams {
  /**
   * Either a ZID or a web3 wallet address.
   * @dev this can probably be improved by using separate properties for ZID and address.
   */
  id?: string;
}

export const useProfile = ({ id }: UseProfileParams) => {
  const currentUser = useSelector(currentUserSelector);

  return useQuery({
    queryKey: ['profile', id],
    /**
     * If ID matches current user, return current user's profile data.
     * Otherwise, fetch profile data from the API.
     */
    queryFn: async (): Promise<ProfileData> => {
      const userThirdWebAddress = currentUser?.wallets?.find((wallet) => wallet.isThirdWeb)?.publicAddress;
      if (
        // If no ID is passed in, i.e. the route is `/profile`.
        !id ||
        // If ID matches current user's primary ZID.
        id === currentUser?.primaryZID?.replace('0://', '') ||
        // If ID matches current user's third web address.
        id.toLowerCase() === userThirdWebAddress?.toLowerCase()
      ) {
        // For current user, always fetch fresh data
        const response = await get('/api/users/current');
        return {
          handle: response.body.profileSummary?.firstName,
          primaryZid: response.body.primaryZID?.replace('0://', ''),
          profileImage: response.body.profileSummary?.profileImage,
          publicAddress: userThirdWebAddress,
          userId: response.body.id,
          followersCount: parseInt(response.body.followersCount) || 0,
          followingCount: parseInt(response.body.followingCount) || 0,
          isZeroProSubscriber: response.body.subscriptions?.zeroPro,
        };
      }

      const endpoint = `/api/v2/users/profile/${ethers.utils.isAddress(id) ? 'address' : 'zid'}/${id}`;
      const response = await get(endpoint);

      return {
        handle: response.body.firstName,
        primaryZid: response.body.primaryZid?.replace('0://', ''),
        profileImage: response.body.profileImage,
        publicAddress: response.body.publicAddress,
        userId: response.body.userId,
        followersCount: parseInt(response.body.followersCount) || 0,
        followingCount: parseInt(response.body.followingCount) || 0,
        isZeroProSubscriber: response.body.isZeroProSubscriber,
      };
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
  });
};
