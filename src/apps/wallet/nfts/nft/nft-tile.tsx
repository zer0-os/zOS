import { NFT } from '../../types';
import styles from './nft-tile.module.scss';

interface NFTTileProps {
  nft: NFT;
}

export const NFTTile = ({ nft }: NFTTileProps) => {
  return (
    <div className={styles.nftTile}>
      <div className={styles.nftImage}>
        <img
          src={
            nft.imageUrl ??
            'https://fastly.picsum.photos/id/431/200/300.jpg?hmac=aUpIWBq8svIaK2ruTnNG-BZuvcDsK9Mr9PuJuYAYEQ0'
          }
          alt={nft.metadata?.name ?? ''}
        />
      </div>
      <div className={styles.nftInfo}>
        <div className={styles.nftName}>{nft.metadata?.name ?? 'Unamed Token'}</div>
        <div className={styles.nftCollection}>{nft.collectionName ?? 'Unnamed Collection'}</div>
      </div>
    </div>
  );
};
