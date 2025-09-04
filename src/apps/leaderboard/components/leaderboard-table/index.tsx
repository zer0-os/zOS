import { useLeaderboard } from '../../hooks/useLeaderboard';
import { TableHeader } from '../table-header';
import { TableRow } from '../table-row';
import { EmptyState } from '../empty-state';
import { Waypoint } from '../waypoint';

import styles from './styles.module.scss';

export const LeaderboardTable = () => {
  const { data: entries, isLoading, error, hasNextPage, isFetchingNextPage, fetchNextPage } = useLeaderboard();

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <EmptyState />;
  }

  if (!entries?.length) {
    return <EmptyState />;
  }

  return (
    <div className={styles.tableContainer}>
      {/* Main Leaderboard Title */}
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Leaderboard</h1>
      </div>

      {/* Fixed Header */}
      <div className={styles.tableHeader}>
        <table className={styles.headerTable}>
          <TableHeader />
        </table>
      </div>

      {/* Scrollable Body */}
      <div className={styles.tableBody}>
        <table className={styles.bodyTable}>
          <tbody>
            {entries.map((entry) => (
              <TableRow key={entry.rank} entry={entry} />
            ))}
          </tbody>
        </table>

        {/* Infinite scroll trigger */}
        {hasNextPage && (
          <div className={styles.waypointContainer}>
            <Waypoint onEnter={fetchNextPage} />
          </div>
        )}

        {/* Loading more indicator */}
        {isFetchingNextPage && (
          <div className={styles.loadingMore}>
            <span>Loading more...</span>
          </div>
        )}
      </div>
    </div>
  );
};
