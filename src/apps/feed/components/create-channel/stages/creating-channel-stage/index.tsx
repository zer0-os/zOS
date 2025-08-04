import React, { useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import ZeroProSymbol from '../../../../../../zero-pro-symbol.svg?react';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { TokenData } from '../../lib/hooks/useTokenFinder';
import { useCreateChannel } from './hooks/useCreateChannel';
import { setLastActiveFeed } from '../../../../../../lib/last-feed';
import styles from './styles.module.scss';

interface CreatingChannelStageProps {
  onComplete: () => void;
  selectedZid: string;
  tokenData: TokenData | null;
  joiningFee: string;
}

export const CreatingChannelStage: React.FC<CreatingChannelStageProps> = ({
  onComplete,
  selectedZid,
  tokenData,
  joiningFee,
}) => {
  const [success, setSuccess] = useState(false);
  const history = useHistory();
  const queryClient = useQueryClient();
  const { createChannel, isCreating, error, reset } = useCreateChannel();

  const handleClose = useCallback(() => {
    setLastActiveFeed(selectedZid);
    history.push(`/feed/${selectedZid}`);
    onComplete();
  }, [selectedZid, history, onComplete]);

  const handleCreateCommunity = useCallback(async () => {
    if (!tokenData) {
      return;
    }

    // Reset any previous error state
    reset();

    const result = await createChannel({
      zid: selectedZid,
      network: tokenData.network,
      tokenAddress: tokenData.address,
      tokenAmount: joiningFee,
      tokenSymbol: tokenData.symbol,
    });

    if (result.success) {
      // Invalidate queries to refresh channel lists immediately
      queryClient.invalidateQueries({ queryKey: ['token-gated-channels', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['token-gated-channels', 'all'] });

      setSuccess(true);
    }
  }, [
    selectedZid,
    tokenData,
    joiningFee,
    createChannel,
    reset,
    queryClient,
  ]);

  if (isCreating) {
    return (
      <div className={styles.LoadingContainer}>
        <div className={styles.Spinner} />
        <div className={styles.LoadingText}>Creating Community...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.ErrorContainer}>
        <div className={styles.ZidTitle}>0://{selectedZid}</div>

        <div className={styles.ErrorTitle}>Failed to Apply Token-Gated Settings</div>
        <div className={styles.ErrorText}>
          Token-gated settings failed to be applied. Your ZID has been purchased, but we encountered an issue setting up
          the token-gated requirements. Please try again. If this issue persists, please contact support.
        </div>
        <div className={styles.SubmitButtonContainer}>
          <Button className={styles.SubmitButton} variant={ButtonVariant.Primary} onPress={onComplete}>
            Close
          </Button>

          <Button
            className={styles.SubmitButton}
            variant={ButtonVariant.Primary}
            isSubmit
            onPress={handleCreateCommunity}
            isDisabled={isCreating}
            isLoading={isCreating}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.SuccessContainer}>
        <div className={styles.LogoGlassWrapper}>
          <ZeroProSymbol width={120} height={140} />
        </div>
        <div className={styles.SuccessTitle}>Successfully Created 0://{selectedZid} community</div>
        <div className={styles.SubmitButtonContainer}>
          <Button className={styles.SubmitButton} variant={ButtonVariant.Primary} isSubmit onPress={handleClose}>
            View Channel
          </Button>
        </div>
      </div>
    );
  }

  // Show success message with create community button
  return (
    <div className={styles.SuccessContainer}>
      <div className={styles.LogoGlassWrapper}>
        <ZeroProSymbol width={120} height={140} />
      </div>
      <div className={styles.SuccessTitle}>
        Your ZID 0://{selectedZid} has been successfully minted. You can now create your community.
      </div>
      <div className={styles.SubmitButtonContainer}>
        <Button
          className={styles.SubmitButton}
          variant={ButtonVariant.Primary}
          isSubmit
          onPress={handleCreateCommunity}
          isDisabled={isCreating}
          isLoading={isCreating}
        >
          Create Community
        </Button>
      </div>
    </div>
  );
};
