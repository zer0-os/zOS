import React from 'react';

import { Sidekick } from './components/sidekick';
import { MembersSidekick } from '../../components/sidekick/variants/members-sidekick';
import { GroupChatContainer } from './components/group-chat';
import styles from './styles.module.scss';
import { Tab } from './components/sidekick/components/tab-list';

export const ChannelsGroupApp: React.FC<{ conversationId: string }> = ({ conversationId }) => {
  return (
    <div className={styles.Feed}>
      <Sidekick initialTab={Tab.Channels} />
      <div className={styles.Wrapper}>
        <GroupChatContainer roomId={conversationId} />
        <MembersSidekick className={styles.MembersSidekick} />
      </div>
    </div>
  );
};
