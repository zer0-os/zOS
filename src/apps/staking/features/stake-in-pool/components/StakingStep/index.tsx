import { LoadingIndicator } from '@zero-tech/zui/components';

import styles from './styles.module.scss';

export interface StakingStepProps {
  formattedAmount: string;
  tokenSymbol?: string;
  actionType?: 'stake' | 'unstake';
}

export const StakingStep = ({ formattedAmount, tokenSymbol, actionType = 'stake' }: StakingStepProps) => {
  const ticker = tokenSymbol || 'TOKENS';
  const actionText = actionType === 'stake' ? 'Staking' : 'Unstaking';
  return (
    <LoadingIndicator
      className={styles.Loading}
      spinnerPosition='left'
      text={`${actionText} ${formattedAmount} ${ticker}...`}
    />
  );
};
