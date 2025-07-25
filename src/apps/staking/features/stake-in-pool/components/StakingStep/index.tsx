import { LoadingIndicator } from '@zero-tech/zui/components';

export interface StakingStepProps {
  formattedAmount: string;
  tokenSymbol?: string;
}

export const StakingStep = ({ formattedAmount, tokenSymbol }: StakingStepProps) => {
  const ticker = tokenSymbol || 'TOKENS';
  return <LoadingIndicator spinnerPosition='left' text={`Staking ${formattedAmount} ${ticker}...`} />;
};
