import { NumberInput } from '@zero-tech/zui/components/Input/NumberInput';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { Badge } from '@zero-tech/zui/components';
import { Card } from '../../../../components/Card';
import { ethers } from 'ethers';

// import { useStakingOptions } from '../../hooks/useStakingOptions';

import styles from './styles.module.scss';

export interface FormStepProps {
  amount: string;
  // eslint-disable-next-line react-redux/no-unused-prop-types
  duration: string;
  // eslint-disable-next-line react-redux/no-unused-prop-types
  poolAddress: string;
  // eslint-disable-next-line react-redux/no-unused-prop-types
  chainId?: number;
  tokenSymbol?: string;
  userBalance?: bigint | null;
  onAmountChange: (amount: string) => void;
  // eslint-disable-next-line react-redux/no-unused-prop-types
  onDurationChange: (duration: string) => void;
  onMax: () => void;
  onNext: () => void;
  onCancel?: () => void;
  isNextDisabled: boolean;
  actionType?: 'stake' | 'unstake';
}

export const FormStep = ({
  amount,
  // duration,
  // poolAddress,
  // chainId,
  tokenSymbol,
  userBalance,
  onAmountChange,
  // onDurationChange,
  onMax,
  onNext,
  onCancel,
  isNextDisabled,
  actionType = 'stake',
}: FormStepProps) => {
  // const { options: stakingOptions } = useStakingOptions(poolAddress, chainId);
  const formattedBalance = userBalance
    ? parseFloat(ethers.utils.formatUnits(userBalance, 18)).toLocaleString(undefined, { maximumFractionDigits: 4 })
    : '0';

  return (
    <>
      <Card className={styles.Input}>
        <label>{actionType === 'stake' ? 'Stake Amount' : 'Unstake Amount'}</label>
        <NumberInput
          value={amount.toString()}
          wrapperClassName={styles.Wrapper}
          onChange={onAmountChange}
          placeholder='0'
          autoFocus={true}
          endEnhancer={
            <div className={styles.InputEnhancer}>
              {tokenSymbol && <Badge content={tokenSymbol} variant='offline' type='text' />}
              <Button onPress={onMax}>MAX</Button>
            </div>
          }
        />
        <div className={styles.AmountHeader}>
          <div />
          <span className={styles.Balance}>
            {actionType === 'stake' ? 'Available' : 'Staked'}: {formattedBalance} {tokenSymbol}
          </span>
        </div>
      </Card>
      {/* <Card className={styles.Lock}>
        <fieldset>
          <legend>Lock Duration</legend>

          {stakingOptions.map((option) => (
            <label className={styles.Option} htmlFor={option.key} key={option.key}>
              <input
                type='radio'
                id={option.key}
                name='lockDuration'
                value={option.key}
                checked={duration === option.key}
                onChange={() => onDurationChange(option.key)}
              />
              <div className={styles.Details}>
                <span>{option.title}</span>
                <span>{option.label}</span>
              </div>
            </label>
          ))}
        </fieldset>
      </Card> */}
      <div className={styles.Actions}>
        {onCancel && (
          <Button onPress={onCancel} variant={ButtonVariant.Secondary}>
            Cancel
          </Button>
        )}
        <Button onPress={onNext} isDisabled={isNextDisabled}>
          Next
        </Button>
      </div>
    </>
  );
};
