import { LoadingIndicator } from '@zero-tech/zui/components';

import styles from './styles.module.scss';

export interface StakingStepProps {
  formattedAmount: string;
  tokenSymbol?: string;
}

export const StakingStep = ({ formattedAmount, tokenSymbol }: StakingStepProps) => {
  const ticker = tokenSymbol || 'TOKENS';
  return (
    <LoadingIndicator
      className={styles.Loading}
      spinnerPosition='left'
      text={`Staking ${formattedAmount} ${ticker}...`}
    />
  );
};
