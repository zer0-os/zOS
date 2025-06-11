import React from 'react';

import { IconButton } from '@zero-tech/zui/components/IconButton';
import { IconArrowLeft } from '@zero-tech/zui/icons';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';

import styles from './styles.module.scss';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const Details: React.FC<Props> = ({ onNext, onBack }) => (
  <>
    <IconButton className={styles.BackButton} onClick={onBack} Icon={IconArrowLeft} size={24} />

    <div className={styles.SectionContainer}>
      <div className={styles.SectionHeaderRow}>
        <div className={styles.SectionLine} />
        <div className={styles.SectionHeader}>Personal Info</div>
        <div className={styles.SectionLine} />
      </div>
    </div>

    <div className={styles.SubmitButtonContainer}>
      <Button className={styles.SubmitButton} variant={ButtonVariant.Primary} isSubmit onPress={onNext}>
        Next
      </Button>
    </div>
  </>
);
