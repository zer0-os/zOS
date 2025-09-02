import { IconPackageMinus } from '@zero-tech/zui/icons';
import { NFT } from '../../types';
import styles from './nft-tile.module.scss';

interface NFTTileProps {
  nft: NFT;
}

export const NFTTile = ({ nft }: NFTTileProps) => {
  return (
    <div className={styles.nftTile}>
      <div className={styles.nftImage}>
        {nft.imageUrl ? (
          <img src={nft.imageUrl} alt={nft.metadata?.name ?? ''} />
        ) : (
          <div className={styles.nftImageFallback}>
            <IconPackageMinus className={styles.icon} size={48} />
          </div>
        )}
      </div>
      <div className={styles.nftInfo}>
        <div className={styles.nftName}>{nft.metadata?.name ?? 'Unamed Token'}</div>
        <div className={styles.nftCollection}>{nft.collectionName ?? 'Unnamed Collection'}</div>
      </div>
    </div>
  );
};
