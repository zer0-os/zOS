import { Button } from '@zero-tech/zui/components/Button';
import { Card } from '../../../../components/Card';
import { useStakingOptions } from '../../hooks/useStakingOptions';

import styles from './styles.module.scss';

export interface ConfirmStepProps {
  amount: string;
  duration: string;
  poolAddress: string;
  chainId?: number;
  tokenSymbol?: string;
  hasSufficientAllowance: boolean;
  isLoading: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export const ConfirmStep = ({
  amount,
  duration,
  poolAddress,
  chainId,
  tokenSymbol,
  hasSufficientAllowance,
  isLoading,
  onBack,
  onConfirm,
}: ConfirmStepProps) => {
  const { options: stakingOptions } = useStakingOptions(poolAddress, chainId);
  const selectedOption = stakingOptions.find((option) => option.key === duration);

  return (
    <>
      <Card className={styles.Card}>
        <label>Stake Amount</label>
        <div className={styles.Amount}>
          {amount} {tokenSymbol || 'TOKENS'}
        </div>
      </Card>
      <Card className={styles.Card}>
        <label>Lock Duration</label>
        <div className={styles.Details}>
          <span>{selectedOption?.title}</span>
          {selectedOption?.label && <span>{selectedOption?.label}</span>}
        </div>
      </Card>
      <div className={styles.Actions}>
        <Button onPress={onBack}>Back</Button>
        <Button onPress={onConfirm} isDisabled={isLoading}>
          {isLoading ? 'Processing...' : hasSufficientAllowance ? 'Stake Now' : 'Confirm Stake'}
        </Button>
      </div>
    </>
  );
};
