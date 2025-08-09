import { useCallback } from 'react';
import { useTokenApproval } from '../../../lib/useTokenApproval';
import { useStaking } from '../../../lib/useStaking';
import type { StakeFlowActions } from './useStakeFlow';
import { selectedWalletSelector } from '../../../../../store/wallet/selectors';
import { useSelector } from 'react-redux';

export interface StakeParams {
  amount: string;
  duration: string;
  poolAddress: string;
  stakingTokenAddress: string;
}

export interface UseStakeActionsParams {
  flowActions: StakeFlowActions;
  hasSufficientAllowance: () => boolean;
  refetchAllowance: () => Promise<any>;
}

export interface UseStakeActionsReturn {
  executeStake: (params: StakeParams) => Promise<void>;
  isLoading: boolean;
  approvalError: string | null;
  stakingError: string | null;
}

export const useStakeActions = ({
  flowActions,
  hasSufficientAllowance,
  refetchAllowance,
}: UseStakeActionsParams): UseStakeActionsReturn => {
  const { address: userAddress } = useSelector(selectedWalletSelector);
  const { approve, isApproving, error: approvalError } = useTokenApproval();
  const { stakeWithLock, stakeWithoutLock, isStaking, error: stakingError } = useStaking();

  const executeStake = useCallback(
    async (params: StakeParams) => {
      const { amount, duration, poolAddress, stakingTokenAddress } = params;

      if (!amount || !stakingTokenAddress) {
        flowActions.setError('Invalid staking parameters');
        return;
      }

      flowActions.setError(null);

      try {
        // Check if approval is needed
        if (!hasSufficientAllowance()) {
          flowActions.goToApproving();

          const approvalResult = await approve(userAddress, stakingTokenAddress, poolAddress, amount);

          if (!approvalResult.success) {
            flowActions.setError((approvalResult as any).error || 'Approval failed');
            flowActions.handleStakeFailure();
            return;
          }

          await refetchAllowance();
        }

        // Execute staking transaction
        flowActions.goToProcessing();

        const lockDurationDays = parseInt(duration);
        const lockDurationSeconds = lockDurationDays * 24 * 60 * 60;

        let stakingResult: { success: boolean; error?: string };

        if (lockDurationDays > 0) {
          stakingResult = await stakeWithLock(poolAddress, amount, lockDurationSeconds.toString());
        } else {
          stakingResult = await stakeWithoutLock(poolAddress, amount);
        }

        if (stakingResult.success) {
          flowActions.goToSuccess();
        } else {
          flowActions.setError((stakingResult as any).error || 'Staking failed');
          flowActions.handleStakeFailure();
        }
      } catch (err: any) {
        flowActions.setError(err.message || 'Transaction failed');
        flowActions.handleStakeFailure();
      }
    },
    [
      flowActions,
      hasSufficientAllowance,
      approve,
      userAddress,
      refetchAllowance,
      stakeWithLock,
      stakeWithoutLock,
    ]
  );

  return {
    executeStake,
    isLoading: isApproving || isStaking,
    approvalError,
    stakingError,
  };
};
