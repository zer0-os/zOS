import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { BridgeParams, isSupportedBridgeChain } from './lib/utils';

import { PanelBody } from '../../../components/layout/panel';
import { WalletBridgeConnect } from './connect/wallet-bridge-connect';
import { WalletBridgeAmount } from './amount/wallet-bridge-amount';

import styles from './wallet-bridge.module.scss';

export enum BridgeStage {
  Connect = 'connect',
  Amount = 'amount',
}

export const WalletBridge = () => {
  const { isConnected, chainId } = useAccount();
  const [stage, setStage] = useState<BridgeStage>(BridgeStage.Connect);

  // Reset to connect stage if wallet gets disconnected or chain becomes unsupported
  useEffect(() => {
    if (!isConnected || !isSupportedBridgeChain(chainId)) {
      setStage(BridgeStage.Connect);
    }
  }, [isConnected, chainId]);

  const amountStage = () => {
    setStage(BridgeStage.Amount);
  };

  const connectStage = () => {
    setStage(BridgeStage.Connect);
  };

  const reviewStage = (params: BridgeParams) => {
    console.log('to review stage', params);
  };

  return (
    <PanelBody className={styles.walletBridge}>
      {stage === BridgeStage.Connect && <WalletBridgeConnect onNext={amountStage} />}
      {stage === BridgeStage.Amount && <WalletBridgeAmount onNext={reviewStage} onBack={connectStage} />}
    </PanelBody>
  );
};
