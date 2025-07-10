import { useNFTsQuery } from '../queries/useNFTsQuery';
import { NFTTile } from './nft/nft-tile';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../store/wallet/selectors';
import { Skeleton } from '@zero-tech/zui/components';
import { WalletEmptyState } from '../components/empty-state/wallet-empty-state';

import styles from './nfts-list.module.scss';

const skeletons = Array.from({ length: 10 });

export const NFTsList = () => {
  const selectedWallet = useSelector(selectedWalletSelector);
  const { data, isPending } = useNFTsQuery(selectedWallet.address);
  const nfts = data?.nfts ?? [];

  return (
    <div className={styles.nftsView}>
      {(data || isPending) && (
        <div className={styles.nftsList}>
          {isPending && skeletons.map((_, index) => <Skeleton key={index} className={styles.nftSkeleton} />)}

          {nfts.map((nft) => (
            <NFTTile key={nft.collectionAddress + nft.id} nft={nft} />
          ))}
        </div>
      )}

      {nfts.length === 0 && <WalletEmptyState className={styles.emptyState} title='No NFTs' />}
    </div>
  );
};
