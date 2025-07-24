import React from 'react';
import { IconZeroProVerified } from '@zero-tech/zui/icons';
import * as HoverCard from '@radix-ui/react-hover-card';
import { useDispatch, useSelector } from 'react-redux';
import { openZeroPro } from '../../store/user-profile';
import { userZeroProSubscriptionSelector } from '../../store/authentication/selectors';

import styles from './styles.module.scss';

export interface ZeroProBadgeProps {
  className?: string;
  size?: number;
}

export const ZeroProBadge: React.FC<ZeroProBadgeProps> = ({ size = 16, className }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = React.useState(false);
  const isZeroProSubscriber = useSelector(userZeroProSubscriptionSelector);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    dispatch(openZeroPro());
  };

  const badge = (
    <div
      className={`${styles.Badge} ${styles.Clickable} ${className || ''}`}
      onClick={handleClick}
      onMouseDown={(e) => e.preventDefault()}
      role='button'
      tabIndex={0}
    >
      <IconZeroProVerified size={size} />
    </div>
  );

  if (isZeroProSubscriber) {
    return badge;
  }

  return (
    <HoverCard.Root openDelay={0} closeDelay={100} open={isOpen} onOpenChange={setIsOpen}>
      <HoverCard.Trigger asChild={true}>{badge}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content className={styles.HoverContent} sideOffset={5}>
          <div className={styles.TooltipText} onClick={handleClick} onMouseDown={(e) => e.preventDefault()}>
            Zero Pro Subscriber
          </div>
          <HoverCard.Arrow className={styles.Arrow} />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};
