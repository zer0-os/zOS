import React, { useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { channelSelector } from '../store/channels/selectors';
import { setActiveConversationId } from '../store/chat';
import { RootState } from '../store/reducer';
import { DefaultRoomLabels } from '../store/channels';

import { MessengerApp } from './messenger';
import { ChannelsGroupApp } from './feed/ChannelsGroupApp';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';

const selectIsConversationsLoaded = (s: RootState) => s.chat.isConversationsLoaded;

export const ConversationRouter: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const dispatch = useDispatch();

  useEffect(() => {
    if (conversationId) {
      dispatch(setActiveConversationId({ id: conversationId }));
    }
  }, [dispatch, conversationId]);

  const channel = useSelector(channelSelector(conversationId));
  const isLoaded = useSelector(selectIsConversationsLoaded);

  if (!isLoaded || !channel) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
        <Spinner />
      </div>
    );
  }

  if (channel.isSocialChannel) {
    return <Redirect to={`/feed/${channel.zid}`} />;
  }

  if (channel.isEncrypted === false || channel.labels?.includes(DefaultRoomLabels.MUTE)) {
    return <ChannelsGroupApp conversationId={conversationId} />;
  }

  // Provide a mock match prop so MessengerApp (MessengerMain) can read conversationId
  // as it expects to be rendered by a Route.
  // This avoids it dispatching an empty setActiveConversationId on mount.
  const match = { params: { conversationId } } as any;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <MessengerApp match={match} />;
};
