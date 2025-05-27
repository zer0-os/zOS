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
}

export interface SimplifiedUser {
  userId: string;
  matrixId: string;
}
