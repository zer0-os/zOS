import { PanelBody } from '../../../components/layout/panel';
import { WalletUserSearch } from './search/wallet-user-search';
import { useSelector } from 'react-redux';
import { nftSelector, sendStageSelector } from '../../../store/wallet/selectors';
import { SendStage } from '../../../store/wallet';
import { WalletTokenSelect } from './token-select/wallet-token-select';
import { WalletTransferAmount } from './transfer-amount/wallet-transfer-amount';
import { WalletNftQuantity } from './nft-quantity/wallet-nft-quantity';
import { WalletReviewTransfer } from './review-transfer/wallet-review-transfer';
import { WalletProcessingTransaction } from './processing/wallet-processing-transaction';
import { WalletTransferSuccess } from './success/wallet-transfer-success';
import { WalletTransferError } from './error/wallet-transfer-error';

import styles from './wallet-send.module.scss';

export const WalletSend = () => {
  const stage = useSelector(sendStageSelector);
  const nft = useSelector(nftSelector);
  return (
    <PanelBody className={styles.walletSend}>
      {stage === SendStage.Search && <WalletUserSearch />}
      {stage === SendStage.Token && <WalletTokenSelect />}
      {stage === SendStage.Amount && (nft ? <WalletNftQuantity /> : <WalletTransferAmount />)}
      {stage === SendStage.Confirm && <WalletReviewTransfer />}
      {(stage === SendStage.Processing || stage === SendStage.Broadcasting) && <WalletProcessingTransaction />}
      {stage === SendStage.Success && <WalletTransferSuccess />}
      {stage === SendStage.Error && <WalletTransferError />}
    </PanelBody>
  );
};
