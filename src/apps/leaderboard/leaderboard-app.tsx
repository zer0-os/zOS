import { Panel } from '../../components/layout/panel';
import { LeaderboardTable } from './components/leaderboard-table';

import styles from './leaderboard-app.module.scss';

export const LeaderboardApp = () => {
  return (
    <div className={styles.leaderboardContainer}>
      <Panel className={styles.leaderboardPanel}>
        <LeaderboardTable />
      </Panel>
    </div>
  );
};
