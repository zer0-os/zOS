import { useDispatch, useSelector } from 'react-redux';
import { nextStage, previousStage, setToken } from '../../../../store/wallet';
import { SendHeader } from '../components/send-header';
import { Input } from '@zero-tech/zui/components';
import { IconSearchMd } from '@zero-tech/zui/icons';
import { useState } from 'react';
import { useBalancesQuery } from '../../queries/useBalancesQuery';
import { Token } from '../../tokens/token';
import { TokenBalance } from '../../types';
import { recipientSelector, selectedWalletSelector } from '../../../../store/wallet/selectors';
import { truncateAddress } from '../../utils/address';

import styles from './wallet-token-select.module.scss';

export const WalletTokenSelect = () => {
  const dispatch = useDispatch();
  const [assetQuery, setAssetQuery] = useState('');
  const selectedWallet = useSelector(selectedWalletSelector);
  const recipient = useSelector(recipientSelector);
  const hasZid = recipient?.primaryZid !== null;
  const hasName = recipient?.name !== null;

  const { data } = useBalancesQuery(selectedWallet.address);
  // TODO: Add search functionality to token balances endpoint
  const assets = data?.tokens.filter((asset) => asset.name.toLowerCase().includes(assetQuery.toLowerCase()));

  const handleTokenClick = (token: TokenBalance) => {
    dispatch(setToken(token));
    dispatch(nextStage());
  };

  const handleBack = () => {
    dispatch(previousStage());
  };

  return (
    <div className={styles.container}>
      <SendHeader title='Select Asset' onBack={handleBack} />

      <div className={styles.content}>
        <div className={styles.inputContainer}>
          <Input
            type='text'
            placeholder='Search...'
            value={assetQuery}
            onChange={setAssetQuery}
            endEnhancer={<IconSearchMd size={16} />}
          />
        </div>

        <div className={styles.resultsContainer}>
          <div className={styles.resultsHeader}>
            <div className={styles.resultsHeaderLabel}>Results</div>
            <div>
              {assets?.map((asset) => (
                <Token key={asset.tokenAddress} token={asset} onClick={() => handleTokenClick(asset)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <span className={styles.footerLabel}>Sending to:</span>
          {hasZid ? (
            <span className={styles.footerValue}>{recipient.primaryZid}</span>
          ) : hasName ? (
            <span className={styles.footerValue}>{recipient.name}</span>
          ) : (
            <span className={styles.footerValue}>{recipient.publicAddress}</span>
          )}
        </div>
        {(hasZid || hasName) && (
          <span className={styles.footerAddress}>{truncateAddress(recipient.publicAddress)}</span>
        )}
      </div>
    </div>
  );
};
