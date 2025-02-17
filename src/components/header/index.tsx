import { ReactNode } from 'react';

import styles from './index.module.scss';
import classNames from 'classnames';
import { PanelTitle } from '../layout/panel';
export interface HeaderProps {
  className?: string;
  /**
   * The element to display on the right-hand side of the header.
   * Note: if you are rendering multiple elements, wrap them in a Fragment (<>...</>).
   */
  end?: ReactNode;
  onClick?: () => void;
  title: ReactNode;
}

export const Header = ({ className, end, onClick, title }: HeaderProps) => {
  // If it's clickable, it should be a button
  const Details = onClick ? 'button' : 'div';

  return (
    <div className={classNames(styles.Header, className)}>
      <Details className={styles.Details} onClick={onClick}>
        <PanelTitle>{title}</PanelTitle>
      </Details>
      {end && <div className={styles.End}>{end}</div>}
    </div>
  );
};
