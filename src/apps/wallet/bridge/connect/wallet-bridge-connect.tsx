import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getHistory } from '../../../../lib/browser';
import { BridgeHeader } from '../components/bridge-header/bridge-header';
import { Button } from '../../components/button/button';
import { truncateAddress } from '../../utils/address';
import { isSupportedBridgeChain, CHAIN_ID_ETHEREUM, CHAIN_NAMES, getL2ChainForL1 } from '../lib/utils';
import { BridgeStatusResponse } from '../../queries/bridgeQueries';
import { BridgeWalletActivity } from '../components/bridge-wallet-activity/bridge-wallet-activity';

import styles from './wallet-bridge-connect.module.scss';

const history = getHistory();

interface WalletBridgeConnectProps {
  onNext: () => void;
  onActivityClick: (activity: BridgeStatusResponse) => void;
}

export const WalletBridgeConnect = ({ onNext, onActivityClick }: WalletBridgeConnectProps) => {
  const { isConnected, address, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const truncatedAddress = truncateAddress(address?.toLowerCase() ?? '');
  const isSupportedChain = isSupportedBridgeChain(chainId);

  const getBridgeDescription = () => {
    if (!chainId || !isSupportedChain) {
      return 'Your wallet is connected. You can bridge tokens between Ethereum and Z Chain (mainnet) or Sepolia and Zephyr (testnet), from your EOA wallet to your Zero Wallet and vice versa.';
    }

    const l1ChainName = CHAIN_NAMES[chainId] || 'Ethereum';
    const l2ChainId = getL2ChainForL1(chainId);
    const l2ChainName = CHAIN_NAMES[l2ChainId] || 'Z Chain';
    const networkType = chainId === CHAIN_ID_ETHEREUM ? 'mainnet' : 'testnet';

    return `Your wallet is connected. You can bridge tokens between ${l1ChainName} and ${l2ChainName} (${networkType}), from your EOA wallet to your Zero Wallet and vice versa.`;
  };

  const onBack = () => {
    history.push('/wallet');
  };

  const onConnect = () => {
    if (isConnected && isSupportedChain) {
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
        ) : !isSupportedChain ? (
          <div className={styles.unsupportedChain}>
            <h3>Unsupported Network</h3>
            <p>Please connect to Ethereum mainnet or Sepolia testnet to bridge tokens.</p>
            {address && <div className={styles.walletAddress}>{truncatedAddress}</div>}
            <div className={styles.buttonGroup}>
              <Button onClick={onDisconnect} variant='secondary'>
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.connectedWallet}>
            <h3>Wallet Connected</h3>
            <p>{getBridgeDescription()}</p>
            {address && <div className={styles.walletAddress}>{truncatedAddress}</div>}
            <div className={styles.buttonGroup}>
              <Button onClick={onDisconnect} variant='secondary'>
                Disconnect
              </Button>
              <Button onClick={onConnect} variant='primary'>
                Continue
              </Button>
            </div>

            <BridgeWalletActivity onActivityClick={onActivityClick} />
          </div>
        )}
      </div>
    </div>
  );
};
