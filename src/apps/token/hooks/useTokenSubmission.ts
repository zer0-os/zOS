import { useCreateZBancToken } from './useCreateZBancToken';
import { useUploadTokenIcon } from './useUploadTokenIcon';
import { FormData } from '../components/token-launcher/utils';
import { useTokenApproval } from '../../../apps/staking/lib/useTokenApproval';
import { currentUserSelector } from '../../../store/authentication/selectors';
import { useSelector } from 'react-redux';
import { config } from '../../../config';

const ZBANC_TOKEN_ADDRESS = config.zbancReserveTokenAddress;
const ZBANC_SPENDER_ADDRESS = config.zbancFactoryAddress;

interface UseTokenSubmissionProps {
  formData: FormData;
  selectedIconFile: File | null;
  onTokenCreated?: (tokenAddress: string) => void;
  setFormError: (message: string) => void;
  setIconError: (message: string) => void;
  clearErrors: () => void;
}

export const useTokenSubmission = ({
  formData,
  selectedIconFile,
  onTokenCreated,
  setFormError,
  setIconError,
  clearErrors,
}: UseTokenSubmissionProps) => {
  const userAddress = useSelector(currentUserSelector)?.zeroWalletAddress;
  const approveToken = useTokenApproval();
  const createTokenMutation = useCreateZBancToken();
  const uploadIconMutation = useUploadTokenIcon();

  const submit = async () => {
    if (!selectedIconFile) {
      setIconError('Please select an icon for your token');
      return;
    }

    clearErrors();

    try {
      // First get approval
      const approvalResult = await approveToken.approve(
        userAddress,
        ZBANC_TOKEN_ADDRESS,
        ZBANC_SPENDER_ADDRESS,
        formData.initialBuyAmount,
        Number(config.zChainId)
      );

      if (!approvalResult.success) {
        setFormError((approvalResult as any).error || 'Approval failed');
        return;
      }

      // Then upload the icon
      const uploadResult = await uploadIconMutation.mutateAsync(selectedIconFile);
      if (!uploadResult.success) {
        setIconError('Failed to upload icon');
        return;
      }

      // Then create the token with the uploaded icon URL
      const result = await createTokenMutation.mutateAsync({
        name: formData.name,
        symbol: formData.symbol,
        initialBuyAmount: formData.initialBuyAmount,
        iconUrl: uploadResult.data.iconUrl,
        description: formData.description,
      });

      if (result.success && onTokenCreated) {
        onTokenCreated(result.data.tokenAddress);
      }
    } catch (error: any) {
      console.error('Token creation failed:', error);

      // Handle different types of errors
      if (error.message?.includes('icon') || error.message?.includes('upload')) {
        setIconError(error.message);
      } else if (error.status === 404) {
        setFormError('Token creation service not found. Please try again later.');
      } else if (error.status === 401) {
        setFormError('Authentication failed. Please log in again.');
      } else if (error.status === 400) {
        setFormError('Invalid token data. Please check your inputs.');
      } else if (error.status === 500) {
        setFormError('Server error. Please try again later.');
      } else if (error.message) {
        setFormError(error.message);
      } else {
        setFormError('Failed to create token. Please try again.');
      }
    }
  };

  const isSubmitting = createTokenMutation.isPending || uploadIconMutation.isPending;
  const isApproving = approveToken.isApproving;

  return {
    submit,
    isSubmitting,
    isApproving,
  };
};
