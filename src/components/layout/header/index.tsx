import { ReactNode } from 'react';

import cn from 'classnames';
import styles from './styles.module.scss';

export interface HeaderProps {
  className?: string;
  children: ReactNode;
}

export const Header = ({ className, children }: HeaderProps) => {
  return <div className={cn(styles.Header, className)}>{children}</div>;
};

export const Title = ({ className, children }: HeaderProps) => {
  return <div className={cn(styles.Title, className)}>{children}</div>;
};
