import React from 'react';

import ZeroProSymbol from '../../../../../zero-pro-symbol.svg?react';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';

import styles from './styles.module.scss';

interface Props {
  onClose: () => void;
  subtitle?: string;
}

export const Success: React.FC<Props> = ({ onClose, subtitle = 'Rewards Unlocked' }) => (
  <>
    <div className={styles.SectionContainer}>
      <div className={styles.LogoGlassWrapper}>
        <ZeroProSymbol width={120} height={140} />
      </div>
      <div className={styles.SuccessTitle}>Zero Pro</div>
      <div className={styles.SuccessSubtitle}>{subtitle}</div>
    </div>

    <div className={styles.SubmitButtonContainer}>
      <Button className={styles.SubmitButton} variant={ButtonVariant.Primary} isSubmit onPress={onClose}>
        Close
      </Button>
    </div>
  </>
);
