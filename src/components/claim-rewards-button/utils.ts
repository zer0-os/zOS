export interface ClaimRewardsError {
  code: string;
  message: string;
}

export const translateClaimError = (error: ClaimRewardsError | string): string => {
  if (typeof error === 'string') {
    return error;
  }

  switch (error.code) {
    case 'NO_REWARDS_FOUND':
      return 'No rewards available to claim at this time.';

    case 'CLAIM_REWARDS_FAILED':
      return `Claim failed: ${error.message}`;

    case 'INVALID_WALLET':
      return 'Invalid wallet address. Please reconnect your wallet.';

    case 'FAILED_TO_CLAIM_REWARDS':
      return 'Technical error occurred. Please try again later.';

    case 'INVALID_PERMISSIONS':
      return 'Authentication required. Please log in again.';

    case 'NO_THIRDWEB_WALLET':
      return 'No thirdweb wallet found. Please connect your wallet.';

    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};
