import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

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
  const { createChannel, isCreating, error } = useCreateChannel();

  useEffect(() => {
    const handleCreateChannel = async () => {
      if (!tokenData) {
        return;
      }

      const result = await createChannel({
        zid: selectedZid,
        network: tokenData.network,
        tokenAddress: tokenData.address,
        tokenAmount: joiningFee,
        tokenSymbol: tokenData.symbol,
      });

      if (result.success) {
        setSuccess(true);
        // Navigate to the new channel after a brief delay
        setTimeout(() => {
          setLastActiveFeed(selectedZid);
          history.push(`/feed/${selectedZid}`);
          onComplete();
        }, 1500);
      }
    };

    if (tokenData) {
      handleCreateChannel();
    }
  }, [
    selectedZid,
    tokenData,
    joiningFee,
    history,
    onComplete,
    createChannel,
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
        <div className={styles.ErrorTitle}>Failed to Create Channel</div>
        <div className={styles.ErrorText}>{error}</div>
        <div className={styles.SubmitButtonContainer}>
          <Button className={styles.SubmitButton} variant={ButtonVariant.Primary} isSubmit onPress={onComplete}>
            Close
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
          <Button className={styles.SubmitButton} variant={ButtonVariant.Primary} isSubmit onPress={onComplete}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
