import { ReactNode, forwardRef, Ref } from 'react';

import { Panel as PanelEnum } from '../../../store/panels/constants';
import { PanelProvider, usePanel } from './context';
import { IconButton } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';

import cn from 'classnames';

import styles from './styles.module.scss';
import { usePanelState } from '../../../store/panels/hooks';

export interface PanelProps {
  className?: string;
  children: ReactNode;
  toggleSidekick?: () => void;
  panel?: PanelEnum;
  name?: string;
}

export const LegacyPanel = forwardRef(
  (
    { children, className, panel, name }: Pick<PanelProps, 'children' | 'className' | 'panel' | 'name'>,
    ref: Ref<HTMLDivElement>
  ) => {
    const { isOpen } = usePanelState(panel);

    return (
      <PanelProvider panel={panel} name={name}>
        {isOpen ? (
          <div ref={ref} className={cn(styles.Legacy, className)} data-testid='legacy-panel'>
            {children}
          </div>
        ) : (
          <PanelCollapsed />
        )}
      </PanelProvider>
    );
  }
);

LegacyPanel.displayName = 'LegacyPanel';

export const Panel = ({
  children,
  className,
  panel,
  name,
}: Pick<PanelProps, 'children' | 'className' | 'panel' | 'name'>) => {
  const { isOpen } = usePanelState(panel);

  return (
    <PanelProvider panel={panel} name={name}>
      {isOpen ? (
        <div className={cn(styles.Panel, className)}>{children}</div>
      ) : (
        <PanelCollapsed className={className} />
      )}
    </PanelProvider>
  );
};

export const PanelBody = ({ children, className }: Pick<PanelProps, 'children' | 'className'>) => {
  return <div className={cn(styles.Body, className)}>{children}</div>;
};

export const PanelHeader = ({ children, className }: Pick<PanelProps, 'children' | 'className'>) => {
  const { panel, toggle, name } = usePanel();

  return (
    <div className={cn(styles.Header, className)}>
      {children ?? name}
      {panel && <IconButton onClick={toggle} Icon={IconXClose} size={24} />}
    </div>
  );
};

export const PanelTitle = ({ children, className }: Pick<PanelProps, 'children' | 'className'>) => {
  return <div className={cn(styles.Title, className)}>{children}</div>;
};

export const PanelCollapsed = ({ className }: Pick<PanelProps, 'className'>) => {
  const { toggle, name } = usePanel();

  return (
    <div className={cn(styles.Collapsed, className)} onClick={toggle}>
      {name}
    </div>
  );
};
