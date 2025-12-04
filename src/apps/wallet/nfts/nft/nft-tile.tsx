import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IconPackageMinus, IconCopy2, IconCheck, IconLinkExternal1 } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';
import { NFT } from '../../types';
import { getNFTExplorerUrl, truncateText } from '../utils';
import { NFTBadge } from '../nft-badge';
import styles from './nft-tile.module.scss';

interface NFTTileProps {
  nft: NFT;
}

export const NFTTile = ({ nft }: NFTTileProps) => {
  const history = useHistory();
  const [isCopied, setIsCopied] = useState(false);
  const nftId = nft.id;
  const nftName = nft.metadata?.name ?? 'Unnamed Token';

  const handleTileClick = () => {
    history.push(`/wallet/nfts/${encodeURIComponent(nft.collectionAddress)}/${encodeURIComponent(nftId)}`);
  };

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(nftId);
    setIsCopied(true);
  };

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getNFTExplorerUrl(nft.collectionAddress, nftId);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Reset to copy icon after 2 seconds
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <div className={styles.nftTile} onClick={handleTileClick}>
      <div className={styles.nftImage}>
        {nft.quantity && nft.quantity > 1 && <NFTBadge type='quantity' value={nft.quantity} />}
        {nft.tokenType && <NFTBadge type='tokenType' value={nft.tokenType} />}
        {nft.imageUrl ? (
          <img src={nft.imageUrl} alt={nftName} />
        ) : (
          <div className={styles.nftImageFallback}>
            <IconPackageMinus className={styles.icon} size={48} />
            {nft.collectionName && <div className={styles.collectionLabel}>{nft.collectionName}</div>}
          </div>
        )}
      </div>
      <div className={styles.nftInfo}>
        <div className={styles.nftName}>{truncateText(nftName, 30)}</div>
        <div className={styles.nftIdContainer}>
          <span className={styles.nftId}>ID: {truncateText(nftId, 20)}</span>
          <IconButton
            onClick={handleCopyId}
            Icon={isCopied ? IconCheck : IconCopy2}
            aria-label={isCopied ? 'Copied!' : 'Copy NFT ID'}
            size={16}
            className={`${styles.copyButton} ${isCopied ? styles.copied : ''}`}
          />
          <IconButton
            onClick={handleExternalLink}
            Icon={IconLinkExternal1}
            aria-label='View on explorer'
            size={16}
            className={styles.externalLinkButton}
          />
        </div>
      </div>
    </div>
  );
};
