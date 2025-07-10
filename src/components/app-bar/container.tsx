import { useRouteMatch } from 'react-router-dom';
import { AppBar as AppBarComponent } from './';
import { useSelector } from 'react-redux';
import { getLastActiveConversation } from '../../lib/last-conversation';
import { useMemo } from 'react';
import { activeZAppFeatureSelector } from '../../store/active-zapp/selectors';
import { activeConversationIdSelector, rawActiveConversationSelector } from '../../store/chat/selectors';
import { hasUnreadHighlightsSelector, hasUnreadNotificationsSelector } from '../../store/channels/selectors';
import { hasActiveWalletSelector } from '../../store/wallet/selectors';

export const AppBar = () => {
  const {
    activeApp,
    hasUnreadNotifications,
    hasUnreadHighlights,
    lastActiveMessengerConversationId,
    zAppIsFullscreen,
    hasActiveWallet,
  } = useAppBar();

  return (
    <AppBarComponent
      activeApp={activeApp}
      hasUnreadNotifications={hasUnreadNotifications}
      hasUnreadHighlights={hasUnreadHighlights}
      lastActiveMessengerConversationId={lastActiveMessengerConversationId}
      zAppIsFullscreen={zAppIsFullscreen}
      hasActiveWallet={hasActiveWallet}
    />
  );
};

const useAppBar = () => {
  const match = useRouteMatch('/:app');
  const activeConversationId = useSelector(activeConversationIdSelector);
  const rawActiveConversation = useSelector(rawActiveConversationSelector);
  const isActiveConversationSocialChannel = rawActiveConversation?.isSocialChannel;
  const hasActiveWallet = useSelector(hasActiveWalletSelector);

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
    hasActiveWallet,
  };
};
