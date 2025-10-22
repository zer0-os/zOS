import { useRouteMatch } from 'react-router-dom';
import { AppBar as AppBarComponent } from './';
import { useSelector } from 'react-redux';
import { getLastActiveConversation } from '../../lib/last-conversation';
import { useMemo } from 'react';
import {
  channelMapSelector,
  isEncryptedNonSocial,
  allChannelsSelector,
  hasUnreadHighlightsSelector,
  hasUnreadNotificationsSelector,
} from '../../store/channels/selectors';
import { activeConversationIdSelector } from '../../store/chat/selectors';
import { hasActiveWalletSelector } from '../../store/wallet/selectors';
import { activeZAppFeatureSelector } from '../../store/active-zapp/selectors';
import { DefaultRoomLabels } from '../../store/channels';

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
  const conversationRouteMatch = useRouteMatch<{ conversationId: string }>('/conversation/:conversationId');
  const activeConversationId = useSelector(activeConversationIdSelector);
  const hasActiveWallet = useSelector(hasActiveWalletSelector);

  const hasUnreadNotifications = useSelector(hasUnreadNotificationsSelector);
  const hasUnreadHighlights = useSelector(hasUnreadHighlightsSelector);
  const conversations = useSelector(allChannelsSelector);
  const conversationMap = useSelector(channelMapSelector);

  const isMuted = (conversation: any) => conversation?.labels?.includes(DefaultRoomLabels.MUTE);

  const pickEncryptedId = (id?: string | null) => {
    const conversation = id ? conversationMap.get(id) : undefined;
    return id && isEncryptedNonSocial(conversation) && !isMuted(conversation) ? id : undefined;
  };

  const firstEncryptedConversationId = useMemo(() => {
    for (const conversation of conversations ?? []) {
      if (isEncryptedNonSocial(conversation) && !isMuted(conversation)) {
        return conversation.id;
      }
    }
    return undefined;
  }, [conversations]);

  const lastActiveMessengerConversationId = useMemo(() => {
    const storedId = pickEncryptedId(getLastActiveConversation());
    if (storedId) {
      return storedId;
    }

    const activeId = pickEncryptedId(activeConversationId);
    if (activeId) {
      return activeId;
    }

    return firstEncryptedConversationId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId, conversationMap, firstEncryptedConversationId]);

  const zAppIsFullscreen = useSelector(activeZAppFeatureSelector('fullscreen'));

  const routeApp = match?.params?.app ?? '';
  const routeConversationId = conversationRouteMatch?.params?.conversationId;
  const routedConversation = routeConversationId ? conversationMap.get(routeConversationId) : undefined;

  const activeApp = useMemo(() => {
    if (routeApp === 'conversation') {
      const unencryptedByRoute = routedConversation && !isEncryptedNonSocial(routedConversation);
      if (unencryptedByRoute || isMuted(routedConversation)) {
        return 'feed';
      }
    }
    return routeApp;
  }, [routeApp, routedConversation]);

  return {
    activeApp,
    hasUnreadNotifications,
    hasUnreadHighlights,
    lastActiveMessengerConversationId,
    zAppIsFullscreen: Boolean(zAppIsFullscreen),
    hasActiveWallet,
  };
};
