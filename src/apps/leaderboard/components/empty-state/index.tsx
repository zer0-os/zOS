import styles from './styles.module.scss';

export const EmptyState = () => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.message}>
        <h3>No leaderboard data available</h3>
        <p>Please try again later.</p>
      </div>
    </div>
  );
};
