import { IconButton } from '@zero-tech/zui/components';
import { SendHeader } from '../components/send-header';
import styles from './wallet-transfer-success.module.scss';
import { IconCheck, IconChevronRightDouble, IconXClose } from '@zero-tech/zui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { reset } from '../../../../store/wallet';
import { getHistory } from '../../../../lib/browser';
import { TokenIcon } from '../../components/token-icon/token-icon';
import {
  amountSelector,
  recipientSelector,
  selectedWalletSelector,
  tokenSelector,
  txReceiptSelector,
} from '../../../../store/wallet/selectors';
import { FormattedNumber } from '../../components/formatted-number/formatted-number';
import { MatrixAvatar } from '../../../../components/matrix-avatar';
import { truncateAddress } from '../../utils/address';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import { Button } from '../../components/button/button';
import { useMemo } from 'react';
import { formatDollars } from '../../utils/format-numbers';

const history = getHistory();

export const WalletTransferSuccess = () => {
  const dispatch = useDispatch();
  const token = useSelector(tokenSelector);
  const amount = useSelector(amountSelector);
  const recipient = useSelector(recipientSelector);
  const currentUser = useSelector(currentUserSelector);
  const selectedWallet = useSelector(selectedWalletSelector);
  const txReceipt = useSelector(txReceiptSelector);

  const handleClose = () => {
    dispatch(reset());
    history.push('/wallet');
  };

  const handleViewTransaction = () => {
    window.open(txReceipt?.blockExplorerUrl, '_blank');
  };

  const dollarAmount = useMemo(() => {
    if (!token.price) return '--';
    return formatDollars(Number(amount) * Number(token.price));
  }, [token.price, amount]);

  return (
    <div className={styles.container}>
      <SendHeader title='Sent' action={<IconButton Icon={IconXClose} onClick={handleClose} />} />
      <div className={styles.content}>
        <div className={styles.tokenHero}>
          <div className={styles.tokenIconContainer}>
            <div className={styles.tokenIconBackground} />
            <div className={styles.tokenIconHighlight} />
            <TokenIcon className={styles.tokenIcon} url={token.logo} name={token.name} chainId={token.chainId} />
          </div>
          <div className={styles.dollarAmount}>{dollarAmount}</div>
          <div className={styles.amount}>
            <FormattedNumber value={amount} /> <span className={styles.tokenSymbol}>{token.symbol}</span>
          </div>
        </div>

        <div className={styles.transferDetails}>
          <div className={styles.recipientInfo}>
            <MatrixAvatar imageURL={currentUser?.profileSummary?.profileImage} size='regular' />
            <div className={styles.recipientName}>
              {currentUser?.primaryZID || currentUser?.profileSummary?.firstName}
            </div>
            <div className={styles.recipientAddress}>{truncateAddress(selectedWallet.address)}</div>
          </div>

          <div className={styles.recipientInfoSeparator}>
            <IconChevronRightDouble />
          </div>

          <div className={styles.recipientInfo}>
            <MatrixAvatar imageURL={recipient?.profileImage} size='regular' />
            <div className={styles.recipientName}>{recipient?.primaryZid || recipient?.name}</div>
            <div className={styles.recipientAddress}>{truncateAddress(recipient?.publicAddress)}</div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.status}>
            <span className={styles.statusIcon}>
              <IconCheck />
            </span>
            <div className={styles.statusText}>Transaction Succeeded</div>
            <div className={styles.statusTimestamp}>{new Date().toLocaleString()}</div>
          </div>

          <div className={styles.actions}>
            <Button onClick={handleClose}>Close</Button>
            <Button onClick={handleViewTransaction} variant='secondary'>
              View Transaction
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
