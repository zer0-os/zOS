import { useDispatch, useSelector } from 'react-redux';
import { nextStage, previousStage, setToken, setNft } from '../../../../store/wallet';
import { SendHeader } from '../components/send-header';
import { Input } from '@zero-tech/zui/components';
import { IconSearchMd } from '@zero-tech/zui/icons';
import { useState } from 'react';
import { useBalancesQuery } from '../../queries/useBalancesQuery';
import { useNFTsQuery } from '../../queries/useNFTsQuery';
import { Token } from '../../tokens/token';
import { NFT, TokenBalance } from '../../types';
import { recipientSelector, selectedWalletSelector } from '../../../../store/wallet/selectors';
import { truncateAddress } from '../../utils/address';
import cn from 'classnames';

import styles from './wallet-token-select.module.scss';

type AssetTab = 'tokens' | 'nfts';

export const WalletTokenSelect = () => {
  const dispatch = useDispatch();
  const [assetQuery, setAssetQuery] = useState('');
  const [activeTab, setActiveTab] = useState<AssetTab>('tokens');
  const selectedWallet = useSelector(selectedWalletSelector);
  const recipient = useSelector(recipientSelector);
  const hasZid = recipient?.primaryZid !== null;
  const hasName = recipient?.name !== null;

  const { data } = useBalancesQuery(selectedWallet.address);
  const { nfts, isLoading: isLoadingNfts } = useNFTsQuery(selectedWallet.address);

  const filteredTokens = data?.tokens?.filter((asset) => asset.name.toLowerCase().includes(assetQuery.toLowerCase()));

  const filteredNfts = nfts?.filter(
    (nft) =>
      nft.metadata?.name?.toLowerCase().includes(assetQuery.toLowerCase()) ||
      nft.collectionName?.toLowerCase().includes(assetQuery.toLowerCase())
  );

  const handleTokenClick = (token: TokenBalance) => {
    dispatch(setNft(null));
    dispatch(setToken(token));
    dispatch(nextStage());
  };

  const handleNftClick = (nft: NFT) => {
    dispatch(setToken(null));
    dispatch(setNft(nft));
    dispatch(nextStage());
  };

  const handleBack = () => {
    dispatch(previousStage());
  };

  return (
    <div className={styles.container}>
      <SendHeader title='Select Asset' onBack={handleBack} />

      <div className={styles.content}>
        <div className={styles.tabSwitcher}>
          <button
            className={cn(styles.tab, { [styles.tabActive]: activeTab === 'tokens' })}
            onClick={() => setActiveTab('tokens')}
          >
            Tokens
          </button>
          <button
            className={cn(styles.tab, { [styles.tabActive]: activeTab === 'nfts' })}
            onClick={() => setActiveTab('nfts')}
          >
            NFTs
          </button>
        </div>

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
          {activeTab === 'tokens' && (
            <div className={styles.resultsHeader}>
              <div className={styles.resultsHeaderLabel}>Tokens</div>
              <div>
                {filteredTokens?.map((asset) => (
                  <Token
                    key={asset.tokenAddress + asset.chainId}
                    token={asset}
                    onClick={() => handleTokenClick(asset)}
                  />
                ))}
                {filteredTokens?.length === 0 && <div className={styles.emptyState}>No tokens found</div>}
              </div>
            </div>
          )}

          {activeTab === 'nfts' && (
            <div className={styles.resultsHeader}>
              <div className={styles.resultsHeaderLabel}>NFTs</div>
              {isLoadingNfts ? (
                <div className={styles.emptyState}>Loading NFTs...</div>
              ) : (
                <div className={styles.nftGrid}>
                  {filteredNfts?.map((nft) => (
                    <NFTSelectItem
                      key={`${nft.collectionAddress}-${nft.id}`}
                      nft={nft}
                      onClick={() => handleNftClick(nft)}
                    />
                  ))}
                </div>
              )}
              {!isLoadingNfts && filteredNfts?.length === 0 && <div className={styles.emptyState}>No NFTs found</div>}
            </div>
          )}
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

interface NFTSelectItemProps {
  nft: NFT;
  onClick: () => void;
}

const NFTSelectItem = ({ nft, onClick }: NFTSelectItemProps) => {
  return (
    <button className={styles.nftSelectItem} onClick={onClick}>
      {nft.imageUrl ? (
        <img src={nft.imageUrl} alt={nft.metadata?.name || 'NFT'} className={styles.nftImage} />
      ) : (
        <div className={styles.nftImagePlaceholder} />
      )}
      <div className={styles.nftInfo}>
        <div className={styles.nftName}>{nft.metadata?.name || 'Unnamed'}</div>
        <div className={styles.nftCollection}>{nft.collectionName}</div>
      </div>
    </button>
  );
};
