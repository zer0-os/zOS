import { LeaderboardEntry } from '../utils';
import { UserDisplay } from './user-display';
import { BadgesDisplay } from './badges-display';
import { CodeDisplay } from './code-display';

import styles from './styles.module.scss';

interface TableRowProps {
  entry: LeaderboardEntry;
}

export const TableRow = ({ entry }: TableRowProps) => {
  return (
    <tr className={styles.tableRow}>
      <td className={styles.rankColumn}>
        <span className={entry.rank <= 3 ? styles.topRankText : styles.rankText}>
          {entry.rank.toString().padStart(2, '0')}
        </span>
      </td>
      <td className={styles.memberColumn}>
        <UserDisplay name={entry.member.name} primaryZid={entry.member.primaryZid} isProUser={entry.member.isProUser} />
      </td>
      <td className={styles.invitedByColumn}>
        {entry.invitedBy ? (
          <UserDisplay
            name={entry.invitedBy.name}
            primaryZid={entry.invitedBy.primaryZID}
            isProUser={entry.invitedBy.isProUser}
          />
        ) : (
          <span className={styles.invitedByText}>—</span>
        )}
      </td>
      <td className={styles.badgesColumn}>
        <BadgesDisplay badges={entry.badges} />
      </td>
      <td className={styles.referralsColumn}>
        <span className={styles.numberText}>{entry.referrals}</span>
      </td>
      <td className={styles.proSubsColumn}>
        <span className={styles.numberText}>{entry.proSubs}</span>
      </td>
      <td className={styles.joinedColumn}>
        <span className={styles.numberText}>{entry.joined}</span>
      </td>
      <td className={styles.meowColumn}>
        <span className={styles.numberText}>{entry.meow}</span>
      </td>
      <td className={styles.codeColumn}>
        <CodeDisplay code={entry.code} />
      </td>
    </tr>
  );
};
