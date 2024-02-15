import { User } from '../store/channels';

export function displayName(user: User) {
  if (!user) {
    return 'Unknown';
  }

  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return name || 'Unknown';
}

export function getUserSubHandle(primaryZID: string, primaryWalletAddress: string) {
  if (primaryZID) {
    return primaryZID;
  }

  if (primaryWalletAddress) {
    return `${primaryWalletAddress.substring(0, 6)}...${primaryWalletAddress.substring(
      primaryWalletAddress.length - 4
    )}`;
  }

  return '';
}
