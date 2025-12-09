import { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IconButton } from '@zero-tech/zui/components';
import { IconChevronLeft, IconCopy2, IconCheck, IconChevronRightDouble, IconPackageMinus } from '@zero-tech/zui/icons';
import { PanelBody } from '../../../../components/layout/panel';
import { useTransactionHistoryQuery } from '../../queries/useTransactionHistoryQuery';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../../store/wallet/selectors';
import { truncateAddress, truncateTokenId } from '../../utils/address';
import { formatDollars } from '../../utils/format-numbers';
import { TokenIcon } from '../../components/token-icon/token-icon';
import { FormattedNumber } from '../../components/formatted-number/formatted-number';
import { getTransactionTypeLabel } from '../utils';
import { displayDateTime } from '../../../../lib/date';
import { Button } from '../../components/button/button';
import styles from './transaction-detail.module.scss';

export const TransactionDetail = () => {
  const { transactionHash } = useParams<{ transactionHash: string }>();
  const history = useHistory();
  const selectedWallet = useSelector(selectedWalletSelector);
  const { data } = useTransactionHistoryQuery(selectedWallet.address);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  let transaction = data?.transactions.find((t) => {
    const decodedHash = decodeURIComponent(transactionHash);
    // Check if it's the new format with action
    if (decodedHash.includes('-')) {
      const [hash, action] = decodedHash.split('-');
      return t.hash === hash && t.action === action;
    }
    // Fallback to old format (just hash) - find first match
    return t.hash === decodedHash;
  });

  const handleBack = () => {
    history.push('/wallet/transactions');
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setCopiedField(field);
  };

  const handleExternalLink = () => {
    if (transaction?.explorerUrl) {
      window.open(transaction.explorerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Reset to copy icon after 2 seconds
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
        setCopiedField(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  if (!transaction) {
    return (
      <PanelBody className={styles.container}>
        <div className={styles.header}>
          <IconButton Icon={IconChevronLeft} className={styles.backButton} onClick={handleBack} />
          <span className={styles.headerLabel}>Transaction</span>
          <span className={styles.headerSpacer} />
        </div>
        <div className={styles.notFound}>Transaction not found</div>
      </PanelBody>
    );
  }

  const transactionLabel = getTransactionTypeLabel(transaction);
  const isReceive = transaction.action === 'receive';
  const isNFT = transaction.tokenId !== null;

  const usdAmount =
    transaction.amount && transaction.token.price
      ? formatDollars(Number(transaction.amount) * transaction.token.price)
      : null;

  const fromAddress = transaction.from;
  const toAddress = transaction.to;
  const fromLabel = truncateAddress(fromAddress);
  const toLabel = truncateAddress(toAddress);

  let tokenName: string;
  if (isNFT) {
    tokenName = transaction.token.name || transaction.token.symbol || 'NFT';
  } else {
    tokenName = transaction.token.name || transaction.token.symbol || 'Token';
  }
  const tokenSymbol = transaction.token.symbol || null;

  const headerLabel = isReceive ? 'Received' : 'Sent';

  return (
    <PanelBody className={styles.container}>
      <div className={styles.header}>
        <IconButton Icon={IconChevronLeft} className={styles.backButton} onClick={handleBack} />
        <span className={styles.headerLabel}>{headerLabel}</span>
        <span className={styles.headerSpacer} />
      </div>

      <div className={styles.content}>
        {/* Token Info - Top section */}
        <div className={styles.tokenInfo}>
          {isNFT ? (
            <div className={styles.nftIcon}>
              <IconPackageMinus size={64} />
            </div>
          ) : (
            <TokenIcon
              url={transaction.token.logo || ''}
              name={tokenName}
              chainId={transaction.token.chainId}
              className={styles.tokenIcon}
            />
          )}
          {tokenSymbol && <div className={styles.tokenSymbol}>{tokenSymbol}</div>}
          {tokenName && tokenName !== tokenSymbol && <div className={styles.tokenName}>{tokenName}</div>}
          {transaction.amount && (
            <div className={styles.tokenAmount}>
              Amount: <FormattedNumber value={transaction.amount} />
            </div>
          )}
          {transaction.tokenId && (
            <div className={styles.tokenIdContainer}>
              <span className={styles.tokenId}>Token ID: #{truncateTokenId(transaction.tokenId)}</span>
              <IconButton
                onClick={() => handleCopy(transaction.tokenId!, 'tokenId')}
                Icon={copiedField === 'tokenId' && isCopied ? IconCheck : IconCopy2}
                aria-label={copiedField === 'tokenId' && isCopied ? 'Copied!' : 'Copy token ID'}
                size={16}
                className={`${styles.copyButton} ${copiedField === 'tokenId' && isCopied ? styles.copied : ''}`}
              />
            </div>
          )}
          {usdAmount && (
            <div className={`${styles.usdAmount} ${isReceive ? styles.positive : ''}`}>
              {isReceive ? `+${usdAmount}` : usdAmount}
            </div>
          )}
        </div>

        {/* Transfer Details - Central section */}
        <div className={styles.transferDetails}>
          <div className={styles.transferSection}>
            <div className={styles.addressInfo}>
              <div className={styles.addressLabel}>From</div>
              <div className={styles.addressContainer}>
                <span className={styles.address}>{fromLabel}</span>
              </div>
            </div>

            <div className={styles.tokenInfoSeparator}>
              <IconChevronRightDouble />
            </div>

            <div className={styles.addressInfo}>
              <div className={styles.addressLabel}>To</div>
              <div className={styles.addressContainer}>
                <span className={styles.address}>{toLabel}</span>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className={styles.details}>
            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>Transaction Hash</div>
              <div className={styles.detailValueContainer}>
                <span className={styles.detailValue}>{truncateAddress(transaction.hash)}</span>
                <IconButton
                  onClick={() => handleCopy(transaction.hash, 'hash')}
                  Icon={copiedField === 'hash' && isCopied ? IconCheck : IconCopy2}
                  aria-label={copiedField === 'hash' && isCopied ? 'Copied!' : 'Copy transaction hash'}
                  size={16}
                  className={`${styles.copyButton} ${copiedField === 'hash' && isCopied ? styles.copied : ''}`}
                />
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>Type</div>
              <div className={styles.detailValue}>{transactionLabel}</div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>Timestamp</div>
              <div className={styles.detailValue}>{displayDateTime(transaction.timestamp)}</div>
            </div>
          </div>
        </div>

        {/* Footer with buttons */}
        <div className={styles.footer}>
          <div className={styles.actions}>
            <Button onClick={handleBack} variant='secondary'>
              Close
            </Button>
            <Button onClick={handleExternalLink} variant='secondary'>
              View Transaction
            </Button>
          </div>
        </div>
      </div>
    </PanelBody>
  );
};
