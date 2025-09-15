import React from 'react';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconRocket, IconArrowLeft } from '@zero-tech/zui/icons';
import styles from './styles.module.scss';

interface HeaderProps {
  onBack: () => void;
}

export const Header = ({ onBack }: HeaderProps) => {
  return (
    <div className={styles.Header}>
      <Button variant={ButtonVariant.Secondary} onPress={onBack} className={styles.BackButton}>
        <IconArrowLeft size={16} />
        Back
      </Button>
      <div className={styles.Title}>
        <IconRocket size={24} className={styles.RocketIcon} />
        Launch Your Token
      </div>
      <div className={styles.Subtitle}>
        Create a new ZBanc token with bonding curve mechanics and automatic graduation to Uniswap V3.
      </div>
    </div>
  );
};
