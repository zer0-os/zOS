import { useCallback } from 'react';
import { useUnstake } from './useUnstake';
import type { TokenAmountFlowActions } from '../../../hooks/useTokenAmountFlow';
import { isWalletAPIError } from '../../../../../store/wallet/utils';

interface UseUnstakeActionsParams {
  flowActions: TokenAmountFlowActions;
}

export const useUnstakeActions = ({ flowActions }: UseUnstakeActionsParams) => {
  const { mutateAsync: unstake, isPending: isUnstaking } = useUnstake();

  const executeUnstake = useCallback(
    async ({ amount, poolAddress, chainId }: { amount: bigint; poolAddress: string; chainId: number }) => {
      try {
        // Go directly to processing since unstake doesn't need approval
        flowActions.goToProcessing();

        // Execute unstake
        await unstake({
          amountWei: amount,
          poolAddress,
          chainId,
        });

        // Success!
        flowActions.goToSuccess();
      } catch (error) {
        let message = 'Unstake failed';
        if (isWalletAPIError(error) && error.response.body.code === 'INSUFFICIENT_BALANCE') {
          message = 'Gas balance is not enough for this transaction';
        }
        console.error('Unstake failed:', error);
        flowActions.setError(error instanceof Error ? error.message : message);
        flowActions.handleFailure();
      }
    },
    [unstake, flowActions]
  );

  return {
    executeUnstake,
    isLoading: isUnstaking,
  };
};
