import { ReactNode } from 'react';
import { ProfileCard } from './';
import * as HoverCard from '@radix-ui/react-hover-card';

export interface Properties {
  userId: string;
  children: ReactNode;
}

export const ProfileCardHover: React.FC<Properties> = ({ userId, children }) => {
  return (
    <HoverCard.Root openDelay={300} closeDelay={200}>
      <HoverCard.Trigger asChild={true}>
        <div>{children}</div>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content>
          <ProfileCard userId={userId} />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};
