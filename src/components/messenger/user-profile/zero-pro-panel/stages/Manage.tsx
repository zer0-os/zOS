import React from 'react';

import { IconButton } from '@zero-tech/zui/components/IconButton';
import { IconArrowLeft } from '@zero-tech/zui/icons';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { useCancelZeroProSubscription } from '../useCancelZeroProSubscription';

import styles from './styles.module.scss';

interface Props {
  onNext: () => void;
  onClose: () => void;
  formattedEndDate: string;
}

export const Manage: React.FC<Props> = ({ onNext, onClose, formattedEndDate }) => {
  const { cancelSubscription, isLoading, error } = useCancelZeroProSubscription();

  const handleCancelSubscription = async () => {
    const success = await cancelSubscription();
    if (success) {
      onNext();
    }
  };

  return (
    <>
      <IconButton className={styles.BackButton} onClick={onClose} Icon={IconArrowLeft} size={24} />

      <div className={styles.SectionContainer}>
        <div className={styles.SectionHeaderRow}>
          <div className={styles.SectionLine} />
          <div className={styles.SectionHeader}>Manage Subscription</div>
          <div className={styles.SectionLine} />
        </div>

        <div className={styles.ManageContent}>
          <div className={styles.PanelList}>
            <div className={styles.PanelItem}>
              <div className={styles.PanelItemText}>
                <div className={styles.PanelItemTitle}>Current Plan</div>
                <div className={styles.PanelItemSubtitle}>ZERO Pro - $10/month</div>
              </div>
            </div>

            <div className={styles.PanelItem}>
              <div className={styles.PanelItemText}>
                <div className={styles.PanelItemTitle}>Status</div>
                <div className={styles.PanelItemSubtitle}>Active</div>
              </div>
            </div>

            <div className={styles.PanelItem}>
              <div className={styles.PanelItemText}>
                <div className={styles.PanelItemTitle}>Current Period Ends</div>
                <div className={styles.PanelItemSubtitle}>{formattedEndDate}</div>
              </div>
            </div>
          </div>

          <div className={styles.CancelSection}>
            <div className={styles.CancelTitle}>Cancel Subscription</div>
            <div className={styles.CancelDescription}>
              You can cancel your subscription at any time. You'll continue to have access to ZERO Pro features until
              the end of your current billing period.
            </div>
          </div>

          {error && <div className={styles.FormError}>{error}</div>}

          <div className={styles.SubmitButtonContainer}>
            <Button
              className={styles.SubmitButton}
              variant={ButtonVariant.Primary}
              onPress={handleCancelSubscription}
              isLoading={isLoading}
              disabled={isLoading}
            >
              Cancel Subscription
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
