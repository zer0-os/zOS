import { Button } from '@zero-tech/zui/components/Button';

import styles from './styles.module.scss';

export interface SuccessStepProps {
  formattedAmount: string;
  duration: string;
  tokenSymbol?: string;
  onClose?: () => void;
}

export const SuccessStep = ({ formattedAmount, duration, tokenSymbol, onClose }: SuccessStepProps) => {
  const ticker = tokenSymbol || 'TOKENS';
  const getDurationText = () => {
    const days = parseInt(duration);
    if (days === 0) return 'without lock';
    if (days === 1) return 'for 1 day';
    return `for ${days} days`;
  };

  return (
    <>
      <div>
        You have successfully staked {formattedAmount} {ticker} {getDurationText()}.
      </div>
      <div className={styles.Actions}>
        <Button onPress={onClose || (() => window.location.reload())}>Done</Button>
      </div>
    </>
  );
};
