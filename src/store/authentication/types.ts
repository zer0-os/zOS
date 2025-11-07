export interface ChallengeResponse {
  message: string;
  nonce: string;
}

export interface AuthorizationResponse {
  accessToken?: string;
  nonceToken?: string;
}

export interface Wallet {
  id: string;
  publicAddress: string;
  isThirdWeb: boolean;
  isDefault?: boolean;
  canAuthenticate?: boolean;
  walletType?: 'EIP4337' | 'external' | 'EOA';
}

interface ProfileSummary {
  firstName: string;
  guildId: string;
  id: string;
  lastName: string;
  profileImage: string;
  ssbPublicKey: string;
  primaryEmail: string;
}

export interface UserPayload {
  data?: User;
  nonce?: string;
}

export interface User {
  id: string;
  createdAt: string;
  handle: string;
  isOnline: boolean;
  lastActiveAt: string;
  profileId: string;
  role: string;
  updatedAt: string;
  profileSummary: ProfileSummary;
  wallets: Wallet[];
  matrixId?: string;
  matrixAccessToken?: string;
  primaryZID?: string;
  primaryWalletAddress?: string;
  zeroWalletAddress?: string;
  totalRewards?: string;
  subscriptions?: {
    zeroPro?: boolean;
    wilderPro?: boolean;
  };
  lastSeenAt?: string;
}

export interface AuthenticationState {
  user: UserPayload;
  nonce?: string;
  displayLogoutModal: boolean;
}
