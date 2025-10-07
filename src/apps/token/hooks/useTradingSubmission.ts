import { useDepositToken, useWithdrawToken, useMintToken, useRedeemToken } from './useZBancTrading';
import { TradingFormData } from '../components/trading-form/utils';
import { useTokenApproval } from '../../../apps/staking/lib/useTokenApproval';
import { config } from '../../../config';
import { ZBancToken } from '../components/utils';

const ZBANC_TOKEN_ADDRESS = config.zbancReserveTokenAddress;
const ZBANC_SPENDER_ADDRESS = config.zbancFactoryAddress;

interface UseTradingSubmissionProps {
  token: ZBancToken;
  formData: TradingFormData;
  userAddress: string;
  onTradeCompleted?: (transactionHash: string) => void;
  setFormError: (message: string) => void;
  clearErrors: () => void;
}

export const useTradingSubmission = ({
  token,
  formData,
  userAddress,
  onTradeCompleted,
  setFormError,
  clearErrors,
}: UseTradingSubmissionProps) => {
  const approveToken = useTokenApproval();
  const depositMutation = useDepositToken();
  const withdrawMutation = useWithdrawToken();
  const mintMutation = useMintToken();
  const redeemMutation = useRedeemToken();

  const submit = async () => {
    if (!userAddress) {
      setFormError('Please connect your wallet');
      return;
    }

    clearErrors();

    try {
      const amount = BigInt(Number(formData.amount) * 10 ** 18).toString();

      // Handle different trading operations
      if (formData.tradeType === 'buy') {
        if (formData.mode === 'deposit') {
          // Buy tokens by depositing MEOW
          const approvalResult = await approveToken.approve(
            userAddress,
            ZBANC_TOKEN_ADDRESS,
            ZBANC_SPENDER_ADDRESS,
            amount,
            Number(config.zChainId)
          );

          if (!approvalResult.success) {
            setFormError((approvalResult as any).error || 'Approval failed');
            return;
          }

          const result = await depositMutation.mutateAsync({
            tokenAddress: token.address,
            amount,
          });

          if (result.success && onTradeCompleted) {
            onTradeCompleted(result.data.transactionHash);
          }
        } else {
          // Buy tokens by minting specific amount
          const result = await mintMutation.mutateAsync({
            tokenAddress: token.address,
            shares: amount,
          });

          if (result.success && onTradeCompleted) {
            onTradeCompleted(result.data.transactionHash);
          }
        }
      } else {
        // Sell tokens
        if (formData.mode === 'deposit') {
          // Sell tokens by withdrawing MEOW
          const result = await withdrawMutation.mutateAsync({
            tokenAddress: token.address,
            amount,
          });

          if (result.success && onTradeCompleted) {
            onTradeCompleted(result.data.transactionHash);
          }
        } else {
          // Sell tokens by redeeming specific amount
          const result = await redeemMutation.mutateAsync({
            tokenAddress: token.address,
            shares: amount,
          });

          if (result.success && onTradeCompleted) {
            onTradeCompleted(result.data.transactionHash);
          }
        }
      }
    } catch (error: any) {
      console.error('Trading failed:', error);

      // Handle different types of errors
      if (error.status === 404) {
        setFormError('Trading service not found. Please try again later.');
      } else if (error.status === 401) {
        setFormError('Authentication failed. Please log in again.');
      } else if (error.status === 400) {
        setFormError('Invalid trading data. Please check your inputs.');
      } else if (error.status === 500) {
        setFormError('Server error. Please try again later.');
      } else if (error.message) {
        setFormError(error.message);
      } else {
        setFormError('Failed to process trade. Please try again.');
      }
    }
  };

  const isSubmitting =
    depositMutation.isPending || withdrawMutation.isPending || mintMutation.isPending || redeemMutation.isPending;
  const isApproving = approveToken.isApproving;

  return {
    submit,
    isSubmitting,
    isApproving,
  };
};
