export interface MemberNetworks {
  id: string;
  matrixId: string;
  handle: string;
  profileImage: string;
  name: string;
  type: string;
  primaryZID: string;
  primaryWalletAddress: string;
  thirdWebWalletAddress?: string;
  subscriptions?: {
    zeroPro: boolean;
    wilderPro: boolean;
  };
}

export interface SimplifiedUser {
  userId: string;
  matrixId: string;
}
