import React from 'react';
import * as ReactHoverCard from '@radix-ui/react-hover-card';

import styles from './styles.module.scss';

export interface ZeroProBadgeProps {
  className?: string;
  iconTrigger: React.ReactNode;
  content: React.ReactNode;
  onClick?: () => void;
}

export const HoverCard: React.FC<ZeroProBadgeProps> = ({ iconTrigger, content, className, onClick }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    onClick?.();
  };

  const trigger = (
    <div
      className={`${styles.Trigger} ${styles.Clickable} ${className || ''}`}
      onClick={handleClick}
      onMouseDown={(e) => e.preventDefault()}
      role='button'
      tabIndex={0}
    >
      {iconTrigger}
    </div>
  );

  return (
    <ReactHoverCard.Root openDelay={0} closeDelay={100} open={isOpen} onOpenChange={setIsOpen}>
      <ReactHoverCard.Trigger asChild={true}>{trigger}</ReactHoverCard.Trigger>
      <ReactHoverCard.Portal>
        <ReactHoverCard.Content className={styles.HoverContent} sideOffset={5}>
          <div className={styles.TooltipText} onClick={handleClick} onMouseDown={(e) => e.preventDefault()}>
            {content}
          </div>
          <ReactHoverCard.Arrow className={styles.Arrow} />
        </ReactHoverCard.Content>
      </ReactHoverCard.Portal>
    </ReactHoverCard.Root>
  );
};
