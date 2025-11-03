import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getHistory } from '../../../../lib/browser';
import { BridgeHeader } from '../components/bridge-header/bridge-header';
import { Button } from '../../components/button/button';
import { truncateAddress } from '../../utils/address';

import styles from './wallet-bridge-connect.module.scss';

const history = getHistory();

interface WalletBridgeConnectProps {
  onNext: () => void;
}

export const WalletBridgeConnect = ({ onNext }: WalletBridgeConnectProps) => {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const truncatedAddress = truncateAddress(address?.toLowerCase() ?? '');

  const onBack = () => {
    history.push('/wallet');
  };

  const onConnect = () => {
    if (isConnected) {
      onNext();
    }
  };

  const onDisconnect = () => {
    disconnect();
  };

  return (
    <div className={styles.container}>
      <BridgeHeader title='Bridge' onBack={onBack} />

      <div className={styles.content}>
        {!isConnected ? (
          <div className={styles.connectWallet}>
            <h3>Connect Your Wallet</h3>
            <p>Connect your Ethereum wallet to bridge tokens</p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button onClick={openConnectModal} variant='primary'>
                  Connect Wallet
                </Button>
              )}
            </ConnectButton.Custom>
          </div>
        ) : (
          <div className={styles.connectedWallet}>
            <h3>Wallet Connected</h3>
            <p>Your Ethereum wallet is connected and ready to bridge tokens</p>
            {address && <div className={styles.walletAddress}>{truncatedAddress}</div>}
            <div className={styles.buttonGroup}>
              <Button onClick={onDisconnect} variant='secondary'>
                Disconnect
              </Button>
              <Button onClick={onConnect} variant='primary'>
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
