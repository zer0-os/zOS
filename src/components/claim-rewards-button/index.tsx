import React from 'react';

import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconCoinsStacked2 } from '@zero-tech/zui/icons';
import { useClaim } from './useClaim';
import { ClaimedRewardsDialog } from '../claimed-rewards-dialog';
import { featureFlags } from '../../lib/feature-flags';

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
  const { claimRewards, isLoading, showModal, closeModal, error, transactionHash } = useClaim();
  console.log('xxxx rewardsTotal', rewardsTotal);

  return (
    <>
      <Button
        className={`${styles.ClaimButton} ${className || ''}`}
        variant={ButtonVariant.Secondary}
        onPress={claimRewards}
        isLoading={isLoading}
        startEnhancer={<IconCoinsStacked2 className={styles.ClaimButtonIcon} size={16} />}
        isDisabled={rewardsTotal === '0 MEOW' || !featureFlags.enableClaimRewards}
      >
        {children}
      </Button>

      {showModal && (
        <ClaimedRewardsDialog
          transactionHash={transactionHash}
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
