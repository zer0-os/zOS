import { ReactNode } from 'react';

import cn from 'classnames';

import styles from './styles.module.scss';

export interface PanelProps {
  className?: string;
  children: ReactNode;
}

export const LegacyPanel = ({ children, className }: PanelProps) => {
  return <div className={cn(styles.Legacy, className)}>{children}</div>;
};
