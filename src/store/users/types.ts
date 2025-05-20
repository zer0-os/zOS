export interface MemberNetworks {
  id: string;
  handle: string;
  profileImage: string;
  name: string;
  type: string;
  primaryZID: string;
  primaryWalletAddress: string;
  thirdWebWalletAddress?: string;
}

export interface SimplifiedUser {
  userId: string;
  matrixId: string;
}
