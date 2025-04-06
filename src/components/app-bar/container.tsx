import { useRouteMatch } from 'react-router-dom';
import { AppBar as AppBarComponent } from './';
import { useSelector } from 'react-redux';
import { getLastActiveConversation } from '../../lib/last-conversation';
import { useMemo } from 'react';
import { activeZAppFeatureSelector } from '../../store/active-zapp/selectors';
import { activeConversationIdSelector, rawActiveConversationSelector } from '../../store/chat/selectors';
import { hasUnreadHighlightsSelector } from '../../store/channels-list/selectors';
import { hasUnreadNotificationsSelector } from '../../store/channels-list/selectors';

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
  const activeConversationId = useSelector(activeConversationIdSelector);
  const rawActiveConversation = useSelector(rawActiveConversationSelector);
  const isActiveConversationSocialChannel = rawActiveConversation?.isSocialChannel;

  const hasUnreadNotifications = useSelector(hasUnreadNotificationsSelector);
  const hasUnreadHighlights = useSelector(hasUnreadHighlightsSelector);

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
