import React from 'react';

import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconCoinsStacked2 } from '@zero-tech/zui/icons';
import { useClaim } from './useClaim';
import { ClaimedRewardsDialog } from '../claimed-rewards-dialog';

import styles from './styles.module.scss';

export interface Properties {
  className?: string;
  children?: React.ReactNode;
  rewardsTotal?: string;
  rewardsTotalInUSD?: string;
}

export const ClaimRewardsButton: React.FC<Properties> = ({
  className,
  children = 'Claim Earnings',
  rewardsTotal,
  rewardsTotalInUSD,
}) => {
  const { claimRewards, isLoading, showModal, closeModal, error } = useClaim();

  return (
    <>
      <Button
        className={`${styles.ClaimButton} ${className || ''}`}
        variant={ButtonVariant.Secondary}
        onPress={claimRewards}
        isLoading={isLoading}
        startEnhancer={<IconCoinsStacked2 className={styles.ClaimButtonIcon} size={16} />}
      >
        {children}
      </Button>

      {showModal && (
        <ClaimedRewardsDialog
          onClose={closeModal}
          meowAmount={rewardsTotal}
          usdAmount={rewardsTotalInUSD}
          error={error}
          isLoading={isLoading}
          onRetry={claimRewards}
        />
      )}
    </>
  );
};
