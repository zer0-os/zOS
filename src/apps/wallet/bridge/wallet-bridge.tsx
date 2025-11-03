import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

import { PanelBody } from '../../../components/layout/panel';
import { WalletBridgeConnect } from './connect/wallet-bridge-connect';

import styles from './wallet-bridge.module.scss';

export enum BridgeStage {
  Connect = 'connect',
}

export const WalletBridge = () => {
  const { isConnected } = useAccount();
  const [stage, setStage] = useState<BridgeStage>(BridgeStage.Connect);

  // Reset to connect stage if wallet gets disconnected
  useEffect(() => {
    if (!isConnected) {
      setStage(BridgeStage.Connect);
    }
  }, [isConnected]);

  const handleConnectNext = () => {
    console.log('Connect stage completed');
  };

  return (
    <PanelBody className={styles.walletBridge}>
      {stage === BridgeStage.Connect && <WalletBridgeConnect onNext={handleConnectNext} />}
    </PanelBody>
  );
};
