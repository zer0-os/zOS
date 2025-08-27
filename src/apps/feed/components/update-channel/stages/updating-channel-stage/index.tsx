import React, { useEffect, useState } from 'react';

import styles from './styles.module.scss';

interface UpdatingChannelStageProps {
  onComplete: () => void;
}

export const UpdatingChannelStage: React.FC<UpdatingChannelStageProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateChannel = async () => {
      try {
        // Step 1: Validating token data
        setStep(1);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Step 2: Updating channel settings
        setStep(2);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Step 3: Confirming update
        setStep(3);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Complete
        onComplete();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update channel');
      }
    };

    updateChannel();
  }, [onComplete]);

  const getStepText = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return 'Validating token data...';
      case 2:
        return 'Updating channel settings...';
      case 3:
        return 'Confirming update...';
      default:
        return 'Updating...';
    }
  };

  if (error) {
    return (
      <div className={styles.Container}>
        <div className={styles.Title}>Update Failed</div>
        <div className={styles.ErrorMessage}>{error}</div>
        <div className={styles.Actions}>
          <button className={styles.RetryButton} onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.Container}>
      <div className={styles.Title}>Updating Channel</div>

      <div className={styles.LoadingSection}>
        <div className={styles.LoadingIndicator} />
        <div className={styles.StepText}>{getStepText(step)}</div>
      </div>
    </div>
  );
};
