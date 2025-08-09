import { FormStep } from './components/FormStep';
import { ConfirmStep } from './components/ConfirmStep';
import { ApprovingStep } from './components/ApprovingStep';
import { StakingStep } from './components/StakingStep';
import { SuccessStep } from './components/SuccessStep';
import { useStakeFlow } from './hooks/useStakeFlow';
import { useStakeData } from './hooks/useStakeData';
import { useStakeActions } from './hooks/useStakeActions';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../../store/wallet/selectors';
import { Alert } from '@zero-tech/zui/components';
import { PoolIcon } from '../../components/PoolIcon';

import styles from './styles.module.scss';

interface StakeInPoolContentProps {
  poolAddress: string;
  poolName?: string;
  chainId?: number;
  poolIconImageUrl?: string;
  onClose?: () => void;
}

const StakeInPoolContent = ({
  poolAddress,
  poolName,
  chainId: poolChainId,
  poolIconImageUrl,
  onClose,
}: StakeInPoolContentProps) => {
  const { address: walletAddress } = useSelector(selectedWalletSelector);

  const flow = useStakeFlow();
  const data = useStakeData({ poolAddress });
  const actions = useStakeActions({
    flowActions: flow,
    hasSufficientAllowance: data.hasSufficientAllowance,
    refetchAllowance: data.refetchAllowance,
  });

  if (!walletAddress) {
    return (
      <div className={styles.Container}>
        <div className={styles.ConnectWallet}>
          <h3>No Wallet Found</h3>
          <p>No ZERO wallet found for this account.</p>
        </div>
      </div>
    );
  }

  const handleFormNext = () => {
    const error = data.validateAmount(data.amount);
    if (error) {
      flow.setError(error);
      return;
    }
    flow.goToConfirm();
  };

  const handleConfirm = () => {
    if (!data.stakingTokenAddress) {
      flow.setError('Staking token not found');
      return;
    }

    actions.executeStake({
      amount: data.amountWei,
      duration: data.duration,
      poolAddress,
      stakingTokenAddress: data.stakingTokenAddress,
    });
  };

  const renderStep = () => {
    switch (flow.step) {
      case 'form':
        return (
          <FormStep
            amount={data.amount}
            duration={data.duration}
            poolAddress={poolAddress}
            tokenSymbol={data.stakingTokenInfo?.symbol}
            userBalance={data.userStakingBalance}
            onAmountChange={data.setAmount}
            onDurationChange={data.setDuration}
            onMax={data.handleMax}
            onNext={handleFormNext}
            onCancel={onClose}
            isNextDisabled={!data.isValidAmount}
          />
        );
      case 'confirm':
        return (
          <ConfirmStep
            amount={data.amount}
            duration={data.duration}
            poolAddress={poolAddress}
            tokenSymbol={data.stakingTokenInfo?.symbol}
            hasSufficientAllowance={data.hasSufficientAllowance()}
            isLoading={actions.isLoading}
            onBack={flow.goBack}
            onConfirm={handleConfirm}
          />
        );
      case 'approving':
        return <ApprovingStep formattedAmount={data.formattedAmount} tokenSymbol={data.stakingTokenInfo?.symbol} />;
      case 'processing':
        return <StakingStep formattedAmount={data.formattedAmount} tokenSymbol={data.stakingTokenInfo?.symbol} />;
      case 'success':
        return (
          <SuccessStep
            formattedAmount={data.formattedAmount}
            duration={data.duration}
            tokenSymbol={data.stakingTokenInfo?.symbol}
            onClose={onClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.Container}>
      <PoolIcon poolName={poolName || 'Staking Pool'} chainId={poolChainId} imageUrl={poolIconImageUrl} />
      {flow.error && <Alert variant='error'>{flow.error}</Alert>}
      {renderStep()}
    </div>
  );
};

interface StakeInPoolProps {
  poolAddress: string;
  poolName?: string;
  chainId?: number;
  poolIconImageUrl?: string;
  onClose?: () => void;
}

export const StakeInPool = ({ poolAddress, poolName, chainId, poolIconImageUrl, onClose }: StakeInPoolProps) => {
  return (
    <StakeInPoolContent
      poolAddress={poolAddress}
      poolName={poolName}
      chainId={chainId}
      poolIconImageUrl={poolIconImageUrl}
      onClose={onClose}
    />
  );
};
