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
  actionType?: 'stake' | 'unstake';
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
  actionType = 'stake',
}: ConfirmStepProps) => {
  const { options: stakingOptions } = useStakingOptions(poolAddress, chainId);
  const selectedOption = stakingOptions.find((option) => option.key === duration);

  return (
    <>
      <Card className={styles.Card}>
        <label>{actionType === 'stake' ? 'Stake Amount' : 'Unstake Amount'}</label>
        <div className={styles.Amount}>
          {amount} {tokenSymbol || 'TOKENS'}
        </div>
      </Card>
      {actionType === 'stake' && (
        <Card className={styles.Card}>
          <label>Lock Duration</label>
          <div className={styles.Details}>
            <span>{selectedOption?.title}</span>
            {selectedOption?.label && <span>{selectedOption?.label}</span>}
          </div>
        </Card>
      )}
      <div className={styles.Actions}>
        <Button onPress={onBack}>Back</Button>
        <Button onPress={onConfirm} isDisabled={isLoading}>
          {isLoading
            ? 'Processing...'
            : actionType === 'unstake'
            ? 'Unstake Now'
            : hasSufficientAllowance
            ? 'Stake Now'
            : 'Confirm Stake'}
        </Button>
      </div>
    </>
  );
};
