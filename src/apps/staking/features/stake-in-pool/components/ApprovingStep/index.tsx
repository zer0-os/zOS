import { LoadingIndicator } from '@zero-tech/zui/components';

export interface ApprovingStepProps {
  formattedAmount: string;
  tokenSymbol?: string;
}

export const ApprovingStep = ({ formattedAmount, tokenSymbol }: ApprovingStepProps) => {
  const ticker = tokenSymbol || 'TOKENS';
  return <LoadingIndicator spinnerPosition='left' text={`Approving ${formattedAmount} ${ticker}...`} />;
};
