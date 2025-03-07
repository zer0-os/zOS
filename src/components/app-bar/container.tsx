import { useRouteMatch } from 'react-router-dom';
import { AppBar as AppBarComponent } from './';
import { denormalizeConversations } from '../../store/channels-list';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { DefaultRoomLabels } from '../../store/channels';

export const AppBar = () => {
  const { activeApp, hasUnreadNotifications, hasUnreadHighlights } = useAppBar();

  return (
    <AppBarComponent
      activeApp={activeApp}
      hasUnreadNotifications={hasUnreadNotifications}
      hasUnreadHighlights={hasUnreadHighlights}
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

  return {
    activeApp: match?.params?.app ?? '',
    hasUnreadNotifications,
    hasUnreadHighlights,
  };
};
