import { Action } from '@zero-tech/zui/components/Post';
import { IconLoading2 } from '@zero-tech/zui/icons';

import classNames from 'classnames';
import styles from './styles.module.scss';

interface StatusActionProps {
  status: 'pending' | 'failed';
}

export const StatusAction = ({ status }: StatusActionProps) => {
  const isDisabled = status === 'pending';
  const className = status === 'failed' ? styles.Failed : styles.Pending;

  const label = status === 'pending' ? 'Posting' : 'Retry Upload';

  return (
    <Action disabled={isDisabled} className={classNames(styles.Action, className)}>
      {status === 'pending' && <IconLoading2 size={12} className={styles.LoadingIcon} />}
      {label}
    </Action>
  );
};
