import { useState } from 'react';
import { BridgeHeader } from '../components/bridge-header/bridge-header';
import { Button } from '../../components/button/button';
import { IconButton } from '@zero-tech/zui/components';
import { FormattedNumber } from '../../components/formatted-number/formatted-number';
import { IconChevronRightDouble, IconLinkExternal1 } from '@zero-tech/zui/icons';
import { truncateAddress } from '../../utils/address';
import { TokenIcon } from '../../components/token-icon/token-icon';
import { BridgeParams, CHAIN_NAMES, openExplorerForAddress } from '../lib/utils';

import styles from './wallet-bridge-review.module.scss';

interface WalletBridgeReviewProps {
  bridgeParams: BridgeParams;
  onNext: () => void;
  onBack: () => void;
}

export const WalletBridgeReview = ({ bridgeParams, onNext: _onNext, onBack }: WalletBridgeReviewProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    console.log('confirming bridge');
  };

  const fromChainName = CHAIN_NAMES[bridgeParams.fromChainId] || 'Unknown';
  const toChainName = CHAIN_NAMES[bridgeParams.toChainId] || 'Unknown';
  const fromWalletAddress = bridgeParams.fromWalletAddress;
  const toWalletAddress = bridgeParams.toWalletAddress;

  const handleDestinationLink = () => {
    openExplorerForAddress(toWalletAddress, bridgeParams.toChainId);
  };

  return (
    <div className={styles.container}>
      <BridgeHeader title='Review' onBack={onBack} />

      <div className={styles.content}>
        <div className={styles.confirmRecipient}>
          <div className={styles.confirmRecipientTitle}>Confirm bridge transaction</div>
          <div className={styles.recipientName}>
            Bridge tokens from {fromChainName} to {toChainName}
          </div>
          {toWalletAddress && (
            <div className={styles.recipientAddress}>
              <span>Destination: {truncateAddress(toWalletAddress)}</span>
              <IconButton
                Icon={IconLinkExternal1}
                onClick={handleDestinationLink}
                aria-label='View on explorer'
                size={16}
              />
            </div>
          )}
        </div>

        <div className={styles.transferDetails}>
          <div className={styles.tokenInfo}>
            <TokenIcon
              url={bridgeParams.fromToken?.logoUrl}
              name={bridgeParams.fromToken?.symbol || 'Token'}
              chainId={bridgeParams.fromChainId}
              className={styles.tokenIcon}
            />
            <div className={styles.tokenName}>
              {bridgeParams.fromToken?.name || bridgeParams.fromToken?.symbol || 'Token'}
            </div>
            <div className={styles.tokenAmount}>
              <FormattedNumber value={bridgeParams.amount || '0'} />
            </div>
          </div>

          <div className={styles.tokenInfoSeparator}>
            <IconChevronRightDouble />
          </div>

          <div className={styles.tokenInfo}>
            <TokenIcon
              url={bridgeParams.toToken?.logoUrl}
              name={bridgeParams.toToken?.symbol || 'Token'}
              chainId={bridgeParams.toChainId}
              className={styles.tokenIcon}
            />
            <div className={styles.tokenName}>
              {bridgeParams.toToken?.name || bridgeParams.toToken?.symbol || 'Token'}
            </div>
            <div className={styles.tokenAmount}>
              <FormattedNumber value={bridgeParams.amount || '0'} />
            </div>
          </div>
        </div>

        <div className={styles.networkInfo}>
          <div className={styles.networkItem}>
            <span>From Network</span>
            <span>{fromChainName}</span>
          </div>
          <div className={styles.networkItem}>
            <span>To Network</span>
            <span>{toChainName}</span>
          </div>
          <div className={styles.networkItem}>
            <span>From Wallet</span>
            <span>{fromWalletAddress ? truncateAddress(fromWalletAddress) : '—'}</span>
          </div>
          <div className={styles.networkItem}>
            <span>To Wallet</span>
            <span>{toWalletAddress ? truncateAddress(toWalletAddress) : '—'}</span>
          </div>
        </div>
      </div>

      <div className={styles.confirmButton}>
        <div className={styles.confirmButtonText}>Review the above before confirming.</div>
        <div className={styles.confirmButtonText}>Once made, your transaction is irreversible.</div>
        <div className={styles.confirmButtonWrapper}>
          <div className={styles.buttonContainer}>
            <Button onClick={handleConfirm}>Confirm Bridge</Button>
            {error && <div className={styles.errorText}>{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
