import { ReactNode } from 'react';

import cn from 'classnames';

import styles from './styles.module.scss';

export interface PanelProps {
  className?: string;
  children: ReactNode;
}

export const Panel = ({ children, className }: PanelProps) => {
  return <div className={cn(styles.Panel, className)}>{children}</div>;
};
