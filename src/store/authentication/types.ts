export interface AuthorizationResponse {
  accessToken?: string;
  nonceToken?: string;
}

interface Wallet {
  id: string;
}

interface ProfileSummary {
  firstName: string;
  guildId: string;
  id: string;
  lastName: string;
  profileImage: string;
  ssbPublicKey: string;
}

export interface UserPayload {
  isLoading?: boolean;
  data?: User;
  nonce?: string;
}

export interface User {
  id: string;
  createdAt: string;
  handle: string;
  isANetworkAdmin: boolean;
  isAMemberOfWorlds: boolean;
  isOnline: boolean;
  lastActiveAt: string;
  profileId: string;
  role: string;
  updatedAt: string;
  profileSummary: ProfileSummary;
  wallets: Wallet[];
}

export interface AuthenticationState {
  user: UserPayload;
  loading: boolean;
  nonce?: string;
}
