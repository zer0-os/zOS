import React from 'react';

import ZeroProSymbol from '../../../../../zero-pro-symbol.svg?react';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';

import styles from './styles.module.scss';

interface Props {
  onClose: () => void;
}

export const Success: React.FC<Props> = ({ onClose }) => (
  <>
    <div className={styles.SectionContainer}>
      <div className={styles.LogoGlassWrapper}>
        <ZeroProSymbol width={120} height={140} />
      </div>
      <div className={styles.SuccessTitle}>ZERO Pro</div>
      <div className={styles.SuccessSubtitle}>Rewards Unlocked</div>
    </div>

    <div className={styles.SubmitButtonContainer}>
      <Button className={styles.SubmitButton} variant={ButtonVariant.Primary} isSubmit onPress={onClose}>
        Close
      </Button>
    </div>
  </>
);
