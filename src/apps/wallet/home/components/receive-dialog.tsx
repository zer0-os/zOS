import { Alert, IconButton, Modal } from '@zero-tech/zui/components';
import styles from './receive-dialog.module.scss';
import { IconCopy2, IconXClose } from '@zero-tech/zui/icons';
import QRCode from 'react-qr-code';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../../store/wallet/selectors';
import { truncateAddress } from '../../utils/address';

export interface ReceiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReceiveDialog = ({ open, onOpenChange }: ReceiveDialogProps) => {
  const selectedWallet = useSelector(selectedWalletSelector);
  const address = selectedWallet?.address;

  return (
    <Modal className={styles.modal} open={open} onOpenChange={onOpenChange}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>Receive - Z Chain</div>
          <IconButton onClick={() => onOpenChange(false)} Icon={IconXClose} aria-label='Close' />
        </div>

        <Alert variant='info' isFilled>
          Only send Z Chain assets to this address
        </Alert>

        <div className={styles.qrCodeContainer}>
          <QRCode value={address} bgColor='#01f4cb' />
        </div>

        <div className={styles.addressContainer}>
          <div className={styles.address}>{truncateAddress(address)}</div>
          <div className={styles.copyButton}>
            <IconButton onClick={() => navigator.clipboard.writeText(address)} Icon={IconCopy2} aria-label='Copy' />
          </div>
        </div>
      </div>
    </Modal>
  );
};
