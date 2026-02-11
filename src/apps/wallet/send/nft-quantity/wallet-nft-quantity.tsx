import { useDispatch, useSelector } from 'react-redux';
import { nextStage, previousStage, setAmount } from '../../../../store/wallet';
import { SendHeader } from '../components/send-header';
import { Button } from '../../components/button/button';
import { Input } from '@zero-tech/zui/components';
import { IconPackageMinus } from '@zero-tech/zui/icons';
import { amountSelector, nftSelector } from '../../../../store/wallet/selectors';
import { useMemo } from 'react';

import styles from './wallet-nft-quantity.module.scss';

export const WalletNftQuantity = () => {
  const dispatch = useDispatch();
  const nft = useSelector(nftSelector);
  const amount = useSelector(amountSelector);

  const maxQuantity = nft?.quantity ?? 1;

  const disabled = useMemo(() => {
    if (!amount) return true;
    const num = Number(amount);
    return !Number.isInteger(num) || num < 1 || num > maxQuantity;
  }, [amount, maxQuantity]);

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    dispatch(setAmount(sanitized || null));
  };

  const handleMax = () => {
    dispatch(setAmount(String(maxQuantity)));
  };

  const handleBack = () => {
    dispatch(previousStage());
  };

  const handleContinue = () => {
    dispatch(nextStage());
  };

  if (!nft) return null;

  return (
    <div className={styles.container}>
      <SendHeader title='Quantity' onBack={handleBack} />

      <div className={styles.content}>
        <div className={styles.nftPreview}>
          {nft.imageUrl ? (
            <img src={nft.imageUrl} alt={nft.metadata?.name || 'NFT'} className={styles.nftImage} />
          ) : (
            <div className={styles.nftImagePlaceholder}>
              <IconPackageMinus size={48} />
            </div>
          )}
          <div className={styles.nftDetails}>
            <div className={styles.nftName}>{nft.metadata?.name || 'Unnamed NFT'}</div>
            <div className={styles.nftCollection}>{nft.collectionName}</div>
          </div>
        </div>

        <div className={styles.quantityInput}>
          <div className={styles.quantityLabel}>
            <span>Quantity</span>
            <button className={styles.maxButton} onClick={handleMax}>
              Max: {maxQuantity}
            </button>
          </div>
          <Input
            type='text'
            placeholder='Enter quantity'
            value={amount || ''}
            onChange={handleAmountChange}
            autoFocus
          />
        </div>

        <Button onClick={handleContinue} disabled={disabled}>
          Continue
        </Button>
      </div>
    </div>
  );
};
