import { useDispatch, useSelector } from 'react-redux';
import { previousStage, transferToken, transferNft } from '../../../../store/wallet';
import styles from './wallet-review-transfer.module.scss';
import { SendHeader } from '../components/send-header';
import { amountSelector, recipientSelector, tokenSelector, nftSelector } from '../../../../store/wallet/selectors';
import { MatrixAvatar } from '../../../../components/matrix-avatar';
import { TokenIcon } from '../../components/token-icon/token-icon';
import { FormattedNumber } from '../../components/formatted-number/formatted-number';
import { Button } from '../../components/button/button';
import { IconChevronRightDouble, IconPackageMinus } from '@zero-tech/zui/icons';
import { truncateAddress } from '../../utils/address';

export const WalletReviewTransfer = () => {
  const dispatch = useDispatch();
  const recipient = useSelector(recipientSelector);
  const token = useSelector(tokenSelector);
  const amount = useSelector(amountSelector);
  const nft = useSelector(nftSelector);

  const isNftTransfer = nft !== null;

  const handleBack = () => {
    dispatch(previousStage());
  };

  const handleConfirm = () => {
    if (isNftTransfer) {
      dispatch(transferNft());
    } else {
      dispatch(transferToken());
    }
  };

  return (
    <div className={styles.container}>
      <SendHeader title='Review' onBack={handleBack} />

      <div className={styles.content}>
        <div className={styles.confirmRecipient}>
          <div className={styles.confirmRecipientTitle}>Confirm transaction with</div>
          <MatrixAvatar className={styles.recipientAvatar} imageURL={recipient?.profileImage} size='regular' />
          <div className={styles.recipientName}>{recipient?.primaryZid || recipient?.name}</div>
          <div className={styles.recipientAddress}>
            {recipient?.publicAddress ? truncateAddress(recipient.publicAddress) : ''}
          </div>
        </div>

        {isNftTransfer ? (
          <div className={styles.nftTransferDetails}>
            <div className={styles.nftPreview}>
              {nft.imageUrl ? (
                <img src={nft.imageUrl} alt={nft.metadata?.name || 'NFT'} className={styles.nftImage} />
              ) : (
                <div className={styles.nftImagePlaceholder}>
                  <IconPackageMinus size={48} />
                </div>
              )}
            </div>
            <div className={styles.nftInfo}>
              <div className={styles.nftName}>{nft.metadata?.name || 'Unnamed NFT'}</div>
              <div className={styles.nftCollection}>{nft.collectionName}</div>
              <div className={styles.nftTokenId}>Token ID: {nft.id}</div>
              {amount && <div className={styles.nftQuantity}>Quantity: {amount}</div>}
            </div>
          </div>
        ) : (
          <div className={styles.transferDetails}>
            <div className={styles.tokenInfo}>
              <TokenIcon url={token?.logo} name={token?.name} chainId={token?.chainId} />
              <div className={styles.tokenName}>{token?.name}</div>
              <div className={styles.tokenAmount}>
                <FormattedNumber value={amount} />
              </div>
            </div>

            <div className={styles.tokenInfoSeparator}>
              <IconChevronRightDouble />
            </div>

            <div className={styles.tokenInfo}>
              <TokenIcon url={token?.logo} name={token?.name} chainId={token?.chainId} />
              <div className={styles.tokenName}>{token?.name}</div>
              <div className={styles.tokenAmount}>
                <FormattedNumber value={amount} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.confirmButton}>
        <div className={styles.confirmButtonText}>Review the above before confirming.</div>
        <div className={styles.confirmButtonText}>Once made, your transaction is irreversible.</div>
        <Button onClick={handleConfirm}>Confirm</Button>
      </div>
    </div>
  );
};
