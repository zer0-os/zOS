export const parsePurchaseError = (error: any): string => {
  const errorMessage = error?.message || error?.error?.message || '';
  const lowerMessage = errorMessage.toLowerCase();

  if (
    lowerMessage.includes('user rejected') ||
    lowerMessage.includes('action_rejected') ||
    lowerMessage.includes('user denied') ||
    lowerMessage.includes('cancelled')
  ) {
    return 'Transaction was cancelled in your wallet';
  }

  if (
    lowerMessage.includes('insufficient funds') ||
    lowerMessage.includes('insufficient balance') ||
    lowerMessage.includes('exceeds balance')
  ) {
    return 'Insufficient MEOW tokens to complete the purchase';
  }

  if (lowerMessage.includes('insufficient allowance') || lowerMessage.includes('allowance too low')) {
    return 'Token approval required - please try again';
  }

  if (
    lowerMessage.includes('gas') ||
    lowerMessage.includes('unpredictable_gas_limit') ||
    lowerMessage.includes('out of gas')
  ) {
    return 'Transaction failed - please try again with higher gas limit';
  }

  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('rpc')
  ) {
    return 'Network connection issue - please check your connection and try again';
  }

  if (lowerMessage.includes('execution reverted')) {
    return 'Transaction failed - please check your wallet and try again';
  }

  if (
    lowerMessage.includes('call revert exception') ||
    lowerMessage.includes('contract not found') ||
    lowerMessage.includes('deployment does not exist')
  ) {
    return 'Network mismatch - please switch to the correct network';
  }

  if (lowerMessage.includes('wallet') || lowerMessage.includes('provider') || lowerMessage.includes('metamask')) {
    return 'Wallet connection issue - please reconnect your wallet and try again';
  }

  return 'Something went wrong - please try again';
};
