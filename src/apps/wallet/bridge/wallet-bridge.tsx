import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useSelector } from 'react-redux';
import { BridgeParams, isSupportedBridgeChain, mapActivityToBridgeParams } from './lib/utils';
import { currentUserSelector } from '../../../store/authentication/selectors';

import { PanelBody } from '../../../components/layout/panel';
import { WalletBridgeConnect } from './connect/wallet-bridge-connect';
import { WalletBridgeAmount } from './amount/wallet-bridge-amount';
import { WalletBridgeReview } from './review/wallet-bridge-review';
import { WalletBridgeProcessing } from './processing/wallet-bridge-processing';
import { WalletBridgeSuccess } from './success/wallet-bridge-success';
import { WalletBridgeError } from './error/wallet-bridge-error';
import { WalletBridgeActivity } from './activity/wallet-bridge-activity';
import { BridgeStatusResponse } from '../queries/bridgeQueries';

import styles from './wallet-bridge.module.scss';

export enum BridgeStage {
  Connect = 'connect',
  Amount = 'amount',
  Review = 'review',
  Processing = 'processing',
  Success = 'success',
  Error = 'error',
  Activity = 'activity',
}

export const WalletBridge = () => {
  const { isConnected, chainId } = useAccount();
  const currentUser = useSelector(currentUserSelector);
  const zeroWalletAddress = currentUser?.zeroWalletAddress;
  const [stage, setStage] = useState<BridgeStage>(BridgeStage.Connect);
  const [bridgeParams, setBridgeParams] = useState<BridgeParams | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
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

  const processingStage = (txHash: string) => {
    setTransactionHash(txHash);
    setStage(BridgeStage.Processing);
  };

  const backToAmount = () => {
    setStage(BridgeStage.Amount);
  };

  const successStage = () => {
    setStage(BridgeStage.Success);
  };

  const errorStage = () => {
    setStage(BridgeStage.Error);
  };

  const resetBridge = () => {
    setBridgeParams(null);
    setTransactionHash(null);
    setStage(BridgeStage.Connect);
  };

  const activityStage = () => {
    setStage(BridgeStage.Activity);
  };

  const onActivityClick = (activity: BridgeStatusResponse) => {
    const params = mapActivityToBridgeParams(activity, zeroWalletAddress);
    setBridgeParams(params);
    setTransactionHash(activity.transactionHash);

    if (activity.status === 'failed') {
      setStage(BridgeStage.Error);
    } else {
      setStage(BridgeStage.Processing);
    }
  };

  return (
    <PanelBody className={styles.walletBridge}>
      {stage === BridgeStage.Connect && <WalletBridgeConnect onNext={amountStage} onViewActivity={activityStage} />}
      {stage === BridgeStage.Amount && <WalletBridgeAmount onNext={reviewStage} onBack={connectStage} />}
      {stage === BridgeStage.Review && bridgeParams && (
        <WalletBridgeReview bridgeParams={bridgeParams} onNext={processingStage} onBack={backToAmount} />
      )}
      {stage === BridgeStage.Processing && bridgeParams && transactionHash && (
        <WalletBridgeProcessing
          bridgeParams={bridgeParams}
          transactionHash={transactionHash}
          onSuccess={successStage}
          onError={errorStage}
          onClose={resetBridge}
        />
      )}
      {stage === BridgeStage.Success && bridgeParams && transactionHash && (
        <WalletBridgeSuccess bridgeParams={bridgeParams} transactionHash={transactionHash} onClose={resetBridge} />
      )}
      {stage === BridgeStage.Error && bridgeParams && transactionHash && (
        <WalletBridgeError bridgeParams={bridgeParams} transactionHash={transactionHash} onClose={resetBridge} />
      )}
      {stage === BridgeStage.Activity && (
        <WalletBridgeActivity onBack={connectStage} onActivityClick={onActivityClick} />
      )}
    </PanelBody>
  );
};
