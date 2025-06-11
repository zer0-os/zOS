import React from 'react';

import { BillingDetails } from '..';
import { IconButton } from '@zero-tech/zui/components/IconButton';
import { IconArrowLeft } from '@zero-tech/zui/icons';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';

import styles from './styles.module.scss';

interface Props {
  billingDetails: BillingDetails;

  onNext: () => void;
  onBack: () => void;
}

export const Payment: React.FC<Props> = ({ billingDetails, onNext, onBack }) => {
  console.log('Billing Details:', billingDetails);
  return (
    <>
      <IconButton className={styles.BackButton} onClick={onBack} Icon={IconArrowLeft} size={24} />

      <div className={styles.SectionContainer}>
        <div className={styles.SectionHeaderRow}>
          <div className={styles.SectionLine} />
          <div className={styles.SectionHeader}>Payment Details</div>
          <div className={styles.SectionLine} />
        </div>
      </div>

      <div className={styles.SubmitButtonContainer}>
        <Button className={styles.SubmitButton} variant={ButtonVariant.Primary} isSubmit onPress={onNext}>
          Subscribe for $10 / Month
        </Button>
      </div>
    </>
  );
};
