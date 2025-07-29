import { LoadingIndicator } from '@zero-tech/zui/components';

import styles from './styles.module.scss';

export interface ApprovingStepProps {
  formattedAmount: string;
  tokenSymbol?: string;
}

export const ApprovingStep = ({ formattedAmount, tokenSymbol }: ApprovingStepProps) => {
  const ticker = tokenSymbol || 'TOKENS';
  return (
    <LoadingIndicator
      className={styles.Loading}
      spinnerPosition='left'
      text={`Approving ${formattedAmount} ${ticker}...`}
    />
  );
};
