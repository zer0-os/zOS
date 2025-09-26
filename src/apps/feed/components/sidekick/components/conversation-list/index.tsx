import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import {
  DefaultRoomLabels,
  NormalizedChannel,
  onAddLabel,
  onRemoveLabel,
  openConversationInFeed,
  User,
} from '../../../../../../store/channels';
import { ConversationItem } from '../../../../../../components/messenger/list/conversation-item';
import { ScrollbarContainer } from '../../../../../../components/scrollbar-container';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { Waypoint } from '../../../../../../components/waypoint';

import styles from './styles.module.scss';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { unencryptedChannelsSelector } from '../../../../../../store/channels/selectors';
import { userIdSelector } from '../../../../../../store/authentication/selectors';
import { usersMapSelector } from '../../../../../../store/users/selectors';
import { GetUser } from '../../../../../../components/messenger/list';

const PAGE_SIZE = 20;

export interface Properties {
  currentUserId: string;
  activeConversationId: string;
  isCollapsed: boolean;
}

const selectGetUser = createSelector(usersMapSelector, (users: Record<string, User>) => (id: string) => users[id]);

export const ConversationList: React.FC<Properties> = React.memo((props) => {
  const { activeConversationId, isCollapsed } = props;

  const dispatch = useDispatch();
  const history = useHistory();
  const conversations = useSelector(unencryptedChannelsSelector) as unknown as NormalizedChannel[];
  const getUser = useSelector(selectGetUser);
  const currentUserId = useSelector(userIdSelector);

  const [visibleItemCount, setVisibleItemCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const scrollContainerRef = useRef<ScrollbarContainer>(null);

  // Filter out archived conversations and social channels
  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation: NormalizedChannel) => {
      const isNotArchived = !conversation.labels?.includes(DefaultRoomLabels.ARCHIVED);
      const isNotSocialChannel = !conversation.isSocialChannel;
      const hasBumpStamp = 'bumpStamp' in conversation;
      return isNotArchived && isNotSocialChannel && hasBumpStamp;
    });
  }, [conversations]);

  const loadMoreItems = useCallback(() => {
    const totalItems = filteredConversations.length;
    if (visibleItemCount >= totalItems || isLoadingMore) return;

    setIsLoadingMore(true);
    requestAnimationFrame(() => {
      setVisibleItemCount((currentVisibleCount) => Math.min(currentVisibleCount + PAGE_SIZE, totalItems));
      setIsLoadingMore(false);
    });
  }, [filteredConversations, visibleItemCount, isLoadingMore]);

  const openExistingConversation = useCallback(
    (id: string) => {
      // Open the conversation in the Feed app context without navigation
      dispatch(openConversationInFeed({ conversationId: id }));
      // Navigate to the Feed app with the conversation ID as zid
      history.push(`/feed/${id}`);
    },
    [dispatch, history]
  );

  const onAddLabelCallback = useCallback(
    (roomId: string, label: string) => {
      dispatch(onAddLabel({ roomId, label }));
    },
    [dispatch]
  );

  const onRemoveLabelCallback = useCallback(
    (roomId: string, label: string) => {
      dispatch(onRemoveLabel({ roomId, label }));
    },
    [dispatch]
  );

  const visibleConversationsToRender = filteredConversations.slice(0, visibleItemCount);
  const hasMoreItems = visibleConversationsToRender.length < filteredConversations.length;

  return (
    <ScrollbarContainer variant='on-hover' ref={scrollContainerRef}>
      <div className={styles.ItemList}>
        {visibleConversationsToRender.length > 0 &&
          visibleConversationsToRender.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              filter=''
              onClick={openExistingConversation}
              currentUserId={currentUserId}
              getUser={getUser as GetUser}
              activeConversationId={activeConversationId}
              onAddLabel={onAddLabelCallback}
              onRemoveLabel={onRemoveLabelCallback}
              isCollapsed={isCollapsed}
            />
          ))}

        {hasMoreItems && (
          <div className={styles.WaypointContainer}>
            <Waypoint onEnter={loadMoreItems} bottomOffset='-60px' />
          </div>
        )}

        {isLoadingMore && (
          <div className={styles.LoadingMore}>
            <Spinner />
          </div>
        )}

        {filteredConversations.length === 0 && <div className={styles.Empty}>No channels found</div>}

        <div className={styles.Buffer} />
      </div>
    </ScrollbarContainer>
  );
});
