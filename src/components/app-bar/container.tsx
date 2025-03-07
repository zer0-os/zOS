import { useRouteMatch } from 'react-router-dom';
import { AppBar as AppBarComponent } from './';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { DefaultRoomLabels } from '../../store/channels';
import { denormalizedConversationsSelector } from '../../store/channels-list/selectors';
import { activeZAppFeatureSelector } from '../../store/active-zapp/selectors';

export const AppBar = () => {
  const { activeApp, hasUnreadNotifications, hasUnreadHighlights, zAppIsFullscreen } = useAppBar();

  return (
    <AppBarComponent
      activeApp={activeApp}
      hasUnreadNotifications={hasUnreadNotifications}
      hasUnreadHighlights={hasUnreadHighlights}
      zAppIsFullscreen={zAppIsFullscreen}
    />
  );
};

const useAppBar = () => {
  const match = useRouteMatch('/:app');

  const hasUnreadNotifications = useSelector((state: RootState) => {
    const conversations = denormalizedConversationsSelector(state);
    return conversations.some(
      (channel) =>
        channel.unreadCount?.total > 0 &&
        !channel.labels?.includes(DefaultRoomLabels.ARCHIVED) &&
        !channel.labels?.includes(DefaultRoomLabels.MUTE)
    );
  });

  const hasUnreadHighlights = useSelector((state: RootState) => {
    const conversations = denormalizedConversationsSelector(state);
    return conversations.some(
      (channel) =>
        channel.unreadCount?.highlight > 0 &&
        !channel.labels?.includes(DefaultRoomLabels.ARCHIVED) &&
        !channel.labels?.includes(DefaultRoomLabels.MUTE)
    );
  });

  const zAppIsFullscreen = useSelector((state: RootState) => {
    const fullscreenFeature = activeZAppFeatureSelector(state, 'fullscreen');
    return !!fullscreenFeature;
  });

  return {
    activeApp: match?.params?.app ?? '',
    hasUnreadNotifications,
    hasUnreadHighlights,
    zAppIsFullscreen,
  };
};
