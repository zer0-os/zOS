import React from 'react';

import { BillingDetails } from '..';
import { IconButton } from '@zero-tech/zui/components/IconButton';
import { IconArrowLeft } from '@zero-tech/zui/icons';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { CardElement } from '@stripe/react-stripe-js';
import { useZeroProSubscription } from '../useZeroProSubscription';

import styles from './styles.module.scss';

interface Props {
  billingDetails: BillingDetails | null;
  onNext: () => void;
  onBack: () => void;
}

export const Payment: React.FC<Props> = ({ billingDetails, onNext, onBack }) => {
  const { subscribe, isLoading, error } = useZeroProSubscription(billingDetails);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await subscribe();
    if (success) {
      onNext();
    }
  };

  return (
    <>
      <IconButton className={styles.BackButton} onClick={onBack} Icon={IconArrowLeft} size={24} />

      <div className={styles.SectionContainer}>
        <div className={styles.SectionHeaderRow}>
          <div className={styles.SectionLine} />
          <div className={styles.SectionHeader}>Payment Details</div>
          <div className={styles.SectionLine} />
        </div>

        <form className={styles.Form} onSubmit={handleSubmit}>
          <div className={styles.CardElementWrapper} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <CardElement
              className={styles.CardElement}
              options={{
                hidePostalCode: true,
              }}
            />
          </div>
          {error && <div className={styles.FormError}>{error}</div>}
          <div className={styles.SubmitButtonContainer}>
            <Button
              className={styles.SubmitButton}
              variant={ButtonVariant.Primary}
              isSubmit
              type='submit'
              isLoading={isLoading}
              disabled={isLoading}
            >
              Subscribe for $10 / Month
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
