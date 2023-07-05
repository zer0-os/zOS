export interface AuthorizationResponse {
  accessToken?: string;
  nonceToken?: string;
}

interface Wallet {
  id: string;
  publicAddress: string;
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
  nonce?: string;
}
