import React, { useEffect, useState } from 'react';

import ZeroProSymbol from '../../../../../../zero-pro-symbol.svg?react';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import styles from './styles.module.scss';

interface CreatingChannelStageProps {
  onComplete: () => void;
  selectedZid: string;
}

export const CreatingChannelStage: React.FC<CreatingChannelStageProps> = ({ onComplete, selectedZid }) => {
  const [success, setSuccess] = useState(false);

  // TODO: Remove this once we have a real success state
  useEffect(() => {
    const timer = setTimeout(() => {
      setSuccess(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!success) {
    return (
      <div className={styles.LoadingContainer}>
        <div className={styles.Spinner} />
        <div className={styles.LoadingText}>Creating Community...</div>
      </div>
    );
  }

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
};
