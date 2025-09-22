import React from 'react';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconArrowLeft, IconTrendUp } from '@zero-tech/zui/icons';
import { ZBancToken } from '../utils';
import styles from './styles.module.scss';

interface HeaderProps {
  token: ZBancToken;
  onBack: () => void;
}

export const Header = ({ token, onBack }: HeaderProps) => {
  return (
    <div className={styles.Header}>
      <Button variant={ButtonVariant.Secondary} onPress={onBack} className={styles.BackButton}>
        <IconArrowLeft size={16} />
        Back
      </Button>
      <div className={styles.Title}>
        <IconTrendUp size={24} className={styles.TrendingIcon} />
        Trade {token.symbol}
      </div>
      <div className={styles.Subtitle}>Buy or sell {token.name} tokens using the ZBanc bonding curve.</div>
    </div>
  );
};
