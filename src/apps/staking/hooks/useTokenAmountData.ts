import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { useSelector } from 'react-redux';
import { useUserStakingInfo } from '../lib/useUserStakingInfo';
import { useStakingToken } from '../lib/useStakingToken';
import { useUserBalances } from '../lib/useUserBalances';
import { selectedWalletSelector } from '../../../store/wallet/selectors';
import type { FlowType } from './useTokenAmountFlow';

interface UseTokenAmountDataParams {
  poolAddress: string;
  flowType: FlowType;
  chainId: number;
}

export const useTokenAmountData = ({ poolAddress, flowType, chainId }: UseTokenAmountDataParams) => {
  const { address: _walletAddress } = useSelector(selectedWalletSelector);
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('0');

  // Get staking token info
  const { stakingTokenAddress, stakingTokenInfo } = useStakingToken(poolAddress, chainId);

  // Get user's staking info (for unstaking)
  const { userStakingInfo } = useUserStakingInfo(poolAddress, chainId);

  // Get user's wallet balance (for staking)
  const { userStakingBalance: walletBalance } = useUserBalances(stakingTokenAddress, null, chainId);

  // Determine which balance to use based on flow type
  const userBalance = useMemo(() => {
    if (flowType === 'stake') {
      return walletBalance;
    } else {
      return userStakingInfo?.amountStaked || null;
    }
  }, [flowType, walletBalance, userStakingInfo?.amountStaked]);

  // Format amount to wei
  const amountWei = useMemo(() => {
    if (!amount || isNaN(parseFloat(amount))) return BigInt(0);
    try {
      return ethers.utils.parseUnits(amount, 18).toBigInt();
    } catch {
      return BigInt(0);
    }
  }, [amount]);

  // Format amount for display
  const formattedAmount = useMemo(() => {
    return parseFloat(amount || '0').toLocaleString();
  }, [amount]);

  // Validate amount
  const validateAmount = useCallback(
    (value: string): string | null => {
      if (!value || value === '0') {
        return `Please enter an amount to ${flowType}`;
      }

      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        return 'Please enter a valid amount';
      }

      if (!userBalance) {
        return flowType === 'stake' ? 'Unable to fetch balance' : 'No staked amount found';
      }

      try {
        const valueWei = ethers.utils.parseUnits(value, 18);
        if (valueWei.gt(userBalance)) {
          return flowType === 'stake' ? 'Amount exceeds available balance' : 'Amount exceeds staked balance';
        }
      } catch {
        return 'Invalid amount format';
      }

      return null;
    },
    [userBalance, flowType]
  );

  // Check if amount is valid
  const isValidAmount = useMemo(() => {
    return validateAmount(amount) === null;
  }, [amount, validateAmount]);

  // Handle max button
  const handleMax = useCallback(() => {
    if (!userBalance) return;
    const maxAmount = ethers.utils.formatUnits(userBalance, 18);
    setAmount(maxAmount);
  }, [userBalance]);

  return {
    amount,
    setAmount,
    duration,
    setDuration,
    amountWei,
    formattedAmount,
    stakingTokenAddress,
    stakingTokenInfo,
    userBalance,
    userStakingInfo,
    validateAmount,
    isValidAmount,
    handleMax,
  };
};
