import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAccount } from 'wagmi';
import { BridgeHeader } from '../components/bridge-header/bridge-header';
import { Button } from '../../components/button/button';
import { IconButton } from '@zero-tech/zui/components';
import { IconChevronRightDouble, IconLinkExternal1 } from '@zero-tech/zui/icons';
import { truncateAddress } from '../../utils/address';
import { TokenIcon } from '../../components/token-icon/token-icon';
import { BridgeParams, CHAIN_NAMES, openExplorerForAddress, formatAddress } from '../lib/utils';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import { useBridgeToken } from '../hooks/useBridgeToken';
import { useBridgeFromEOA } from '../hooks/useBridgeFromEOA';

import styles from './wallet-bridge-review.module.scss';

interface WalletBridgeReviewProps {
  bridgeParams: BridgeParams;
  onNext: (transactionHash: string) => void;
  onBack: () => void;
}

export const WalletBridgeReview = ({ bridgeParams, onNext, onBack }: WalletBridgeReviewProps) => {
  const currentUser = useSelector(currentUserSelector);
  const zeroWalletAddress = currentUser?.zeroWalletAddress;
  const { address: eoaAddress } = useAccount();
  const [error, setError] = useState<string | null>(null);

  const bridgeMutation = useBridgeToken({
    zeroWalletAddress,
    onSuccess: (transactionHash) => {
      onNext(transactionHash);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to initiate bridge');
    },
  });

  const eoaBridgeMutation = useBridgeFromEOA({
    onSuccess: (transactionHash) => {
      onNext(transactionHash);
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to initiate bridge');
    },
  });

  const getButtonText = () => {
    if (eoaBridgeMutation.isApproving) return 'Approving Token...';
    if (eoaBridgeMutation.isBridging) return 'Bridging...';
    if (bridgeMutation.isPending) return 'Processing...';
    return 'Confirm Bridge';
  };

  const isSubmitting = bridgeMutation.isPending || eoaBridgeMutation.isPending;

  const onSubmit = async () => {
    if (!bridgeParams.fromToken?.tokenAddress) {
      setError('Token address is required');
      return;
    }

    setError(null);

    const isFromEOA = bridgeParams.fromWalletAddress === eoaAddress;
    const isFromZeroWallet = bridgeParams.fromWalletAddress === zeroWalletAddress;

    if (isFromEOA) {
      await eoaBridgeMutation.bridgeFromEOA({
        fromChainId: bridgeParams.fromChainId,
        toChainId: bridgeParams.toChainId,
        tokenAddress: bridgeParams.fromToken.tokenAddress,
        amount: bridgeParams.amount,
        destinationAddress: bridgeParams.toWalletAddress || '',
        decimals: bridgeParams.fromToken.decimals || 18,
        eoaAddress: eoaAddress || '',
      });
    } else if (isFromZeroWallet) {
      bridgeMutation.mutate({
        tokenAddress: bridgeParams.fromToken.tokenAddress,
        amount: bridgeParams.amount,
        to: bridgeParams.toWalletAddress || '',
        fromChainId: bridgeParams.fromChainId,
        toChainId: bridgeParams.toChainId,
      });
    } else {
      setError('Invalid wallet configuration');
    }
  };

  const fromChainName = CHAIN_NAMES[bridgeParams.fromChainId] || 'Unknown';
  const toChainName = CHAIN_NAMES[bridgeParams.toChainId] || 'Unknown';
  const fromWalletAddress = bridgeParams.fromWalletAddress;
  const toWalletAddress = bridgeParams.toWalletAddress;

  const isFromZeroWallet = fromWalletAddress === zeroWalletAddress;
  const isToZeroWallet = toWalletAddress === zeroWalletAddress;
  const fromWalletType = isFromZeroWallet ? 'Zero Wallet' : 'EOA Wallet';
  const toWalletType = isToZeroWallet ? 'Zero Wallet' : 'EOA Wallet';

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
            {fromChainName} ({fromWalletType}) to {toChainName} ({toWalletType})
          </div>
          {toWalletAddress && (
            <div className={styles.recipientAddress}>
              <span>Receiving Wallet: {truncateAddress(toWalletAddress)}</span>
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
              className={styles.smallTokenIcon}
            />
            <div className={styles.tokenName}>
              {bridgeParams.fromToken?.name || bridgeParams.fromToken?.symbol || 'Token'}
            </div>
            <div className={styles.tokenAmount}>{bridgeParams.amount || '0'}</div>
            <div className={styles.chainName}>{fromChainName}</div>
            {fromWalletAddress && <div className={styles.walletAddress}>{formatAddress(fromWalletAddress)}</div>}
          </div>

          <div className={styles.tokenInfoSeparator}>
            <IconChevronRightDouble />
          </div>

          <div className={styles.tokenInfo}>
            <TokenIcon
              url={bridgeParams.toToken?.logoUrl}
              name={bridgeParams.toToken?.symbol || 'Token'}
              chainId={bridgeParams.toChainId}
              className={styles.smallTokenIcon}
            />
            <div className={styles.tokenName}>
              {bridgeParams.toToken?.name || bridgeParams.toToken?.symbol || 'Token'}
            </div>
            <div className={styles.tokenAmount}>{bridgeParams.amount || '0'}</div>
            <div className={styles.chainName}>{toChainName}</div>
            {toWalletAddress && <div className={styles.walletAddress}>{formatAddress(toWalletAddress)}</div>}
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
            <span>Receiving Wallet</span>
            <span>{toWalletAddress ? truncateAddress(toWalletAddress) : '—'}</span>
          </div>
        </div>
      </div>

      <div className={styles.confirmButton}>
        <div className={styles.confirmButtonText}>Review the above before confirming.</div>
        <div className={styles.confirmButtonText}>Once made, your transaction is irreversible.</div>
        <div className={styles.confirmButtonWrapper}>
          <div className={styles.buttonContainer}>
            <Button onClick={onSubmit} disabled={isSubmitting}>
              {getButtonText()}
            </Button>
            {error && <div className={styles.errorText}>{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
