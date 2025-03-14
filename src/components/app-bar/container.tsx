import { useRouteMatch } from 'react-router-dom';
import { AppBar as AppBarComponent } from './';
import { denormalizeConversations } from '../../store/channels-list';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { DefaultRoomLabels } from '../../store/channels';
import { getLastActiveConversation } from '../../lib/last-conversation';

export const AppBar = () => {
  const { activeApp, hasUnreadNotifications, hasUnreadHighlights, lastActiveMessengerConversationId } = useAppBar();

  return (
    <AppBarComponent
      activeApp={activeApp}
      hasUnreadNotifications={hasUnreadNotifications}
      hasUnreadHighlights={hasUnreadHighlights}
      lastActiveMessengerConversationId={lastActiveMessengerConversationId}
    />
  );
};

const useAppBar = () => {
  const match = useRouteMatch('/:app');

  const hasUnreadNotifications = useSelector((state: RootState) => {
    const conversations = denormalizeConversations(state);
    return conversations.some(
      (channel) =>
        channel.unreadCount?.total > 0 &&
        !channel.labels?.includes(DefaultRoomLabels.ARCHIVED) &&
        !channel.labels?.includes(DefaultRoomLabels.MUTE)
    );
  });

  const hasUnreadHighlights = useSelector((state: RootState) => {
    const conversations = denormalizeConversations(state);
    return conversations.some(
      (channel) =>
        channel.unreadCount?.highlight > 0 &&
        !channel.labels?.includes(DefaultRoomLabels.ARCHIVED) &&
        !channel.labels?.includes(DefaultRoomLabels.MUTE)
    );
  });

  const lastActiveMessengerConversationId = getLastActiveConversation();

  return {
    activeApp: match?.params?.app ?? '',
    hasUnreadNotifications,
    hasUnreadHighlights,
    lastActiveMessengerConversationId,
  };
};
