import React from 'react';
import classNames from 'classnames';
import styles from './styles.module.scss';

export interface StatusProps {
  type: 'active' | 'idle' | 'busy' | 'offline' | 'unread';
  className?: string;
}

export const Status = React.memo(({ type, className }: StatusProps) => {
  return <div className={classNames(styles.Status, className)} data-status-type={type} />;
});

Status.displayName = 'Status';
