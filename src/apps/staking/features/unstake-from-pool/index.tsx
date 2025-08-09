import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../../store/wallet/selectors';
import { Alert } from '@zero-tech/zui/components';
import { FormStep } from '../stake-in-pool/components/FormStep';
import { ConfirmStep } from '../stake-in-pool/components/ConfirmStep';
import { SuccessStep } from '../stake-in-pool/components/SuccessStep';
import { StakingStep } from '../stake-in-pool/components/StakingStep';
import { PoolIcon } from '../../components/PoolIcon';
import { useTokenAmountFlow } from '../../hooks/useTokenAmountFlow';
import { useTokenAmountData } from '../../hooks/useTokenAmountData';
import { useUnstakeActions } from './hooks/useUnstakeActions';

import styles from './styles.module.scss';

export interface UnstakeFromPoolProps {
  poolAddress: string;
  poolName: string;
  chainId: number;
  poolIconImageUrl: string;
  onClose?: () => void;
}

const UnstakeFromPoolContent = ({
  poolAddress,
  poolName,
  chainId,
  poolIconImageUrl,
  onClose,
}: UnstakeFromPoolProps) => {
  const { address: walletAddress } = useSelector(selectedWalletSelector);
  const targetChainId = chainId || 43113;

  const flow = useTokenAmountFlow('unstake');
  const data = useTokenAmountData({ poolAddress, chainId: targetChainId, flowType: 'unstake' });
  const actions = useUnstakeActions({
    flowActions: flow,
    chainId: targetChainId,
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
    actions.executeUnstake({
      amount: data.amountWei,
      poolAddress,
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
            chainId={targetChainId}
            tokenSymbol={data.stakingTokenInfo?.symbol}
            userBalance={data.userBalance}
            onAmountChange={data.setAmount}
            onDurationChange={data.setDuration}
            onMax={data.handleMax}
            onNext={handleFormNext}
            onCancel={onClose}
            isNextDisabled={!data.isValidAmount}
            actionType='unstake'
          />
        );
      case 'confirm':
        return (
          <ConfirmStep
            amount={data.amount}
            duration={data.duration}
            poolAddress={poolAddress}
            chainId={targetChainId}
            tokenSymbol={data.stakingTokenInfo?.symbol}
            hasSufficientAllowance={true} // Unstake doesn't need allowance
            isLoading={actions.isLoading}
            onBack={flow.goBack}
            onConfirm={handleConfirm}
            actionType='unstake'
          />
        );
      case 'processing':
        return (
          <StakingStep
            actionType='unstake'
            formattedAmount={data.formattedAmount}
            tokenSymbol={data.stakingTokenInfo?.symbol}
          />
        );
      case 'success':
        return (
          <SuccessStep
            formattedAmount={data.formattedAmount}
            duration={data.duration}
            tokenSymbol={data.stakingTokenInfo?.symbol}
            onClose={onClose}
            actionType='unstake'
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.Container}>
      <PoolIcon poolName={poolName || 'Staking Pool'} chainId={targetChainId} imageUrl={poolIconImageUrl} />
      {flow.error && <Alert variant='error'>{flow.error}</Alert>}
      {renderStep()}
    </div>
  );
};

export const UnstakeFromPool = ({
  poolAddress,
  poolName,
  chainId,
  poolIconImageUrl,
  onClose,
}: UnstakeFromPoolProps) => {
  return (
    <UnstakeFromPoolContent
      poolAddress={poolAddress}
      poolName={poolName}
      chainId={chainId}
      poolIconImageUrl={poolIconImageUrl}
      onClose={onClose}
    />
  );
};
