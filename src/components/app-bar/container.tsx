import { useRouteMatch } from 'react-router-dom';
import { AppBar as AppBarComponent } from './';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { DefaultRoomLabels } from '../../store/channels';
import { getLastActiveConversation } from '../../lib/last-conversation';
import { channelSelector, allDenormalizedChannelsSelector } from '../../store/channels/selectors';
import { useMemo } from 'react';
import { activeZAppFeatureSelector } from '../../store/active-zapp/selectors';

export const AppBar = () => {
  const {
    activeApp,
    hasUnreadNotifications,
    hasUnreadHighlights,
    lastActiveMessengerConversationId,
    zAppIsFullscreen,
  } = useAppBar();

  return (
    <AppBarComponent
      activeApp={activeApp}
      hasUnreadNotifications={hasUnreadNotifications}
      hasUnreadHighlights={hasUnreadHighlights}
      lastActiveMessengerConversationId={lastActiveMessengerConversationId}
      zAppIsFullscreen={zAppIsFullscreen}
    />
  );
};

const useAppBar = () => {
  const match = useRouteMatch('/:app');
  const activeConversationId = useSelector((state: RootState) => state.chat.activeConversationId);
  const activeConversation = useSelector(channelSelector(activeConversationId));
  const isActiveConversationSocialChannel = activeConversation?.isSocialChannel;

  const hasUnreadNotifications = useSelector((state: RootState) => {
    const conversations = allDenormalizedChannelsSelector(state);
    return conversations.some(
      (channel) =>
        channel.unreadCount?.total > 0 &&
        !channel.labels?.includes(DefaultRoomLabels.ARCHIVED) &&
        !channel.labels?.includes(DefaultRoomLabels.MUTE)
    );
  });

  const hasUnreadHighlights = useSelector((state: RootState) => {
    const conversations = allDenormalizedChannelsSelector(state);
    return conversations.some(
      (channel) =>
        channel.unreadCount?.highlight > 0 &&
        !channel.labels?.includes(DefaultRoomLabels.ARCHIVED) &&
        !channel.labels?.includes(DefaultRoomLabels.MUTE)
    );
  });

  const lastActiveMessengerConversationId = useMemo(() => {
    if (!isActiveConversationSocialChannel) {
      return getLastActiveConversation();
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!isActiveConversationSocialChannel ? activeConversationId : null]);

  const zAppIsFullscreen = useSelector(activeZAppFeatureSelector('fullscreen'));

  return {
    activeApp: match?.params?.app ?? '',
    hasUnreadNotifications,
    hasUnreadHighlights,
    lastActiveMessengerConversationId,
    zAppIsFullscreen: Boolean(zAppIsFullscreen),
  };
};
