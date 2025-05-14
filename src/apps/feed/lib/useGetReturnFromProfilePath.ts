import { useRouteMatch } from 'react-router-dom';

export const useGetReturnFromProfilePath = () => {
  const route = useRouteMatch();
  const isHome = route.path?.startsWith('/home');
  const isProfile = route.path?.startsWith('/profile');
  const isFeed = route.path?.startsWith('/feed');
  const isConversation = route.path?.startsWith('/conversation');

  const getReturnFromProfilePath = () => {
    if (isHome) return '/home';
    if (isProfile) return `/profile/${route.params?.zid}`;
    if (isFeed) return `/feed/${route.params?.zid}`;
    if (isConversation) return `/conversation/${route.params?.conversationId}`;
    return '/feed';
  };

  return {
    returnPath: getReturnFromProfilePath(),
  };
};
