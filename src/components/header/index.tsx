import { ReactNode } from 'react';

import styles from './index.module.scss';
import classNames from 'classnames';

export interface HeaderProps {
  className?: string;
  /**
   * The element to display on the right-hand side of the header.
   * Note: if you are rendering multiple elements, wrap them in a Fragment (<>...</>).
   */
  end?: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  subtitle?: ReactNode;
  title: ReactNode;
}

export const Header = ({ icon, className, end, onClick, subtitle, title }: HeaderProps) => {
  // If it's clickable, it should be a button
  const Details = onClick ? 'button' : 'div';

  return (
    <div className={classNames(styles.Header, className)}>
      <Details className={styles.Details} onClick={onClick}>
        {icon && <div className={styles.Avatar}>{icon}</div>}
        <span className={styles.Description}>
          <div className={styles.Title}>{title}</div>
          {subtitle && <div className={styles.Subtitle}>{subtitle}</div>}
        </span>
      </Details>
      {end && <div className={styles.End}>{end}</div>}
    </div>
  );
};
