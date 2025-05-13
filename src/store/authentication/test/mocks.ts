import { AuthenticationState } from '../types';

export const mockAuthenticationState: AuthenticationState = {
  user: {
    data: {
      id: '12345',
      createdAt: '2023-01-01T00:00:00.000Z',
      handle: 'mock-handle',
      isOnline: false,
      lastActiveAt: '2023-01-01T00:00:00.000Z',
      profileId: 'mock-profile-id',
      updatedAt: '2023-01-01T00:00:00.000Z',
      role: 'user',
      profileSummary: {
        firstName: 'Mock',
        lastName: 'User',
        guildId: 'mock-guild-id',
        id: 'mock-profile-id',
        profileImage: 'mock-profile-image',
        ssbPublicKey: 'mock-ssb-public-key',
        primaryEmail: 'mock-primary-email',
      },
      wallets: [],
    },
  },
  displayLogoutModal: false,
};
