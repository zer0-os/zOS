import { useCallback } from 'react';
import { useNFTsQuery } from '../queries/useNFTsQuery';
import { NFTTile } from './nft/nft-tile';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../store/wallet/selectors';
import { Skeleton } from '@zero-tech/zui/components';
import { WalletEmptyState } from '../components/empty-state/wallet-empty-state';
import { Waypoint } from '../../leaderboard/components/waypoint';

import styles from './nfts-list.module.scss';

const skeletons = Array.from({ length: 6 });

export const NFTsList = () => {
  const selectedWallet = useSelector(selectedWalletSelector);
  const { nfts, isPending, hasNextPage, isFetchingNextPage, fetchNextPage } = useNFTsQuery(selectedWallet.address);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className={styles.nftsView}>
      {(nfts.length > 0 || isPending) && (
        <div className={styles.nftsList}>
          {nfts.map((nft) => (
            <NFTTile key={nft.collectionAddress + nft.id} nft={nft} />
          ))}

          {(isPending || isFetchingNextPage) &&
            skeletons.map((_, index) => <Skeleton key={index} className={styles.nftSkeleton} />)}
        </div>
      )}

      {hasNextPage && !isFetchingNextPage && <Waypoint onEnter={handleLoadMore} />}

      {nfts.length === 0 && !isPending && <WalletEmptyState className={styles.emptyState} title='No NFTs' />}
    </div>
  );
};
