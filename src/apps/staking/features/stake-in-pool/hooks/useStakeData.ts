import { useState, useMemo } from 'react';
import { ethers } from 'ethers';
import { usePool } from '../../../lib/usePool';
import { useTokenAllowance } from '../../../lib/useTokenAllowance';

export interface StakeFormData {
  amount: string;
  duration: string;
}

export interface UseStakeDataParams {
  poolAddress: string;
  chainId: number;
}

export interface UseStakeDataReturn {
  // Form state
  amount: string;
  duration: string;
  setAmount: (amount: string) => void;
  setDuration: (duration: string) => void;

  // Computed values
  amountWei: string;
  formattedAmount: string;
  isValidAmount: boolean;

  // Pool data
  stakingTokenAddress: string | null;
  stakingTokenInfo: any | null;
  userStakingBalance: bigint | null;
  allowance: bigint | null;

  // Actions
  handleMax: () => void;
  hasSufficientAllowance: () => boolean;
  refetchAllowance: () => Promise<any>;

  // Validation
  validateAmount: (amount: string) => string | null;
}

export const useStakeData = ({ poolAddress, chainId }: UseStakeDataParams): UseStakeDataReturn => {
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('0');

  const { userStakingBalance, stakingTokenInfo } = usePool(poolAddress, chainId);
  const { allowance, refetch: refetchAllowance } = useTokenAllowance(
    stakingTokenInfo?.address || null,
    poolAddress,
    chainId
  );

  const amountWei = useMemo(() => {
    if (!amount || amount === '') return '0';
    try {
      return ethers.utils.parseUnits(amount, 18).toString();
    } catch {
      return '0';
    }
  }, [amount]);

  const formattedAmount = useMemo(() => {
    return amount && !isNaN(parseFloat(amount)) ? parseFloat(amount).toLocaleString() : '';
  }, [amount]);

  const isValidAmount = useMemo(() => {
    if (amount === '' || parseFloat(amount) <= 0 || !userStakingBalance) {
      return false;
    }

    try {
      const wei = ethers.utils.parseUnits(amount, 18);
      const requiredAmount = BigInt(wei.toString());
      if (requiredAmount <= 0n) return false;
      return requiredAmount <= userStakingBalance;
    } catch {
      return false;
    }
  }, [amount, userStakingBalance]);

  const handleMax = () => {
    if (userStakingBalance) {
      const maxAmount = ethers.utils.formatUnits(userStakingBalance, 18);
      const formatted = maxAmount.replace(/\.0+$/, '');
      setAmount(formatted);
    }
  };

  const hasSufficientAllowance = () => {
    if (allowance === null || !amountWei) return false;

    const requiredAmount = BigInt(amountWei);
    const approvedAmount = allowance;

    return approvedAmount >= requiredAmount;
  };

  const validateAmount = (amount: string): string | null => {
    if (!amount || amount === '') {
      return 'Please enter an amount';
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Please enter a valid amount';
    }

    try {
      const wei = ethers.utils.parseUnits(amount, 18);
      const requiredAmount = BigInt(wei.toString());
      if (requiredAmount <= 0n) {
        return 'Please enter a valid amount';
      }

      if (userStakingBalance && requiredAmount > userStakingBalance) {
        return 'Amount exceeds available balance';
      }
    } catch {
      return 'Please enter a valid amount';
    }

    return null;
  };

  return {
    amount,
    duration,
    setAmount,
    setDuration,
    amountWei,
    formattedAmount,
    isValidAmount,
    stakingTokenAddress: stakingTokenInfo?.address || null,
    stakingTokenInfo,
    userStakingBalance,
    allowance,
    handleMax,
    hasSufficientAllowance,
    refetchAllowance,
    validateAmount,
  };
};
