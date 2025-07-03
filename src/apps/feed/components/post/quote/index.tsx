import { forwardRef } from 'react';
import { MatrixAvatar } from '../../../../../components/matrix-avatar';
import { Timestamp } from '@zero-tech/zui/components/Post/components/Timestamp';
import { IconZeroProVerified } from '@zero-tech/zui/icons';

import classNames from 'classnames';
import styles from './style.module.scss';

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(({ children, className }, ref) => {
  return (
    <div ref={ref} className={classNames(styles.Quote, className)}>
      {children}
    </div>
  );
});

export interface DetailsProps {
  className?: string;
  avatarURL: string;
  name: string;
  timestamp: number;
  isZeroProSubscriber?: boolean;
}

export const Details = forwardRef<HTMLDivElement, DetailsProps>(
  ({ avatarURL, name, className, timestamp, isZeroProSubscriber }, ref) => {
    return (
      <div ref={ref} className={classNames(styles.Details, className)}>
        <div className={styles.User}>
          <MatrixAvatar size='small' imageURL={avatarURL} />
          <div className={styles.Name}>
            <span className={styles.NameText}>{name}</span>
            {isZeroProSubscriber && <IconZeroProVerified size={18} />}
          </div>
        </div>
        {'⋅'}
        <Timestamp className={styles.Timestamp} timestamp={timestamp} />
      </div>
    );
  }
);
