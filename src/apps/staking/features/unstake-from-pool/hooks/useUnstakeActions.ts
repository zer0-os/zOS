import { useCallback } from 'react';
import { useUnstake } from './useUnstake';
import type { TokenAmountFlowActions } from '../../../hooks/useTokenAmountFlow';

interface UseUnstakeActionsParams {
  flowActions: TokenAmountFlowActions;
  chainId: number;
}

export const useUnstakeActions = ({ flowActions, chainId: _chainId }: UseUnstakeActionsParams) => {
  const { mutateAsync: unstake, isPending: isUnstaking } = useUnstake();

  const executeUnstake = useCallback(
    async ({ amount, poolAddress }: { amount: bigint; poolAddress: string }) => {
      try {
        // Go directly to processing since unstake doesn't need approval
        flowActions.goToProcessing();

        // Execute unstake
        await unstake({
          amountWei: amount,
          poolAddress,
        });

        // Success!
        flowActions.goToSuccess();
      } catch (error) {
        console.error('Unstake failed:', error);
        flowActions.setError(error instanceof Error ? error.message : 'Unstake failed');
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
