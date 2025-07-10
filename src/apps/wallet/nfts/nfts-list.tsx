import { useNFTsQuery } from '../queries/useNFTsQuery';
import { NFTTile } from './nft/nft-tile';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../store/wallet/selectors';

import styles from './nfts-list.module.scss';

export const NFTsList = () => {
  const selectedWallet = useSelector(selectedWalletSelector);
  const { data } = useNFTsQuery(selectedWallet.address);

  return (
    <div className={styles.nftsList}>
      {data?.nfts.map((nft) => (
        <NFTTile key={nft.collectionAddress + nft.id} nft={nft} />
      ))}
    </div>
  );
};
