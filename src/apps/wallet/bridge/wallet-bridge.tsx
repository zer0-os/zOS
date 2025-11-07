import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { BridgeParams, isSupportedBridgeChain } from './lib/utils';

import { PanelBody } from '../../../components/layout/panel';
import { WalletBridgeConnect } from './connect/wallet-bridge-connect';
import { WalletBridgeAmount } from './amount/wallet-bridge-amount';
import { WalletBridgeReview } from './review/wallet-bridge-review';

import styles from './wallet-bridge.module.scss';

export enum BridgeStage {
  Connect = 'connect',
  Amount = 'amount',
  Review = 'review',
}

export const WalletBridge = () => {
  const { isConnected, chainId } = useAccount();
  const [stage, setStage] = useState<BridgeStage>(BridgeStage.Connect);
  const [bridgeParams, setBridgeParams] = useState<BridgeParams | null>(null);
  const previousChainIdRef = useRef<number | undefined>(chainId);

  // Reset to connect stage if wallet gets disconnected, changes or chain becomes unsupported
  useEffect(() => {
    if (!isConnected || !isSupportedBridgeChain(chainId)) {
      setStage(BridgeStage.Connect);
      setBridgeParams(null);
      previousChainIdRef.current = chainId;
      return;
    }

    if (previousChainIdRef.current !== undefined && previousChainIdRef.current !== chainId) {
      setStage(BridgeStage.Connect);
      setBridgeParams(null);
    }

    previousChainIdRef.current = chainId;
  }, [isConnected, chainId]);

  const amountStage = () => {
    setStage(BridgeStage.Amount);
  };

  const connectStage = () => {
    setStage(BridgeStage.Connect);
    setBridgeParams(null);
  };

  const reviewStage = (params: BridgeParams) => {
    setBridgeParams(params);
    setStage(BridgeStage.Review);
  };

  const backToAmount = () => {
    setStage(BridgeStage.Amount);
  };

  return (
    <PanelBody className={styles.walletBridge}>
      {stage === BridgeStage.Connect && <WalletBridgeConnect onNext={amountStage} />}
      {stage === BridgeStage.Amount && <WalletBridgeAmount onNext={reviewStage} onBack={connectStage} />}
      {stage === BridgeStage.Review && bridgeParams && (
        <WalletBridgeReview bridgeParams={bridgeParams} onNext={() => {}} onBack={backToAmount} />
      )}
    </PanelBody>
  );
};
