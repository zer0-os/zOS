import { ReactNode } from 'react';

import cn from 'classnames';

import styles from './styles.module.scss';

export interface PanelProps {
  className?: string;
  children: ReactNode;
  toggleSidekick?: () => void;
}

export const LegacyPanel = ({ children, className }: PanelProps) => {
  return <div className={cn(styles.Legacy, className)}>{children}</div>;
};

export const Panel = ({ children, className }: PanelProps) => {
  return <div className={cn(styles.Panel, className)}>{children}</div>;
};

export const PanelBody = ({ children, className }: PanelProps) => {
  return <div className={cn(styles.Body, className)}>{children}</div>;
};

export const PanelHeader = ({ children, className, toggleSidekick }: PanelProps) => {
  return (
    <div className={cn(styles.Header, className)} onClick={toggleSidekick}>
      {children}
    </div>
  );
};

export const PanelTitle = ({ children, className }: PanelProps) => {
  return <div className={cn(styles.Title, className)}>{children}</div>;
};
