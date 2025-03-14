import { useOwnedZids } from '../../../../lib/hooks/useOwnedZids';
import { parseWorldZid } from '../../../../lib/zid';
import { FeedChatContainer } from './index';
import { useRouteMatch } from 'react-router-dom';

export const FeedChat = () => {
  const route = useRouteMatch<{ zid: string }>('/feed/:zid');
  const zid = route?.params?.zid;
  const { zids } = useOwnedZids();

  // Check if the current ZID is owned by the user
  const isOwnedZid = zid && zids?.some((userZid) => parseWorldZid(userZid) === zid);

  // Only render if the user owns this ZID
  if (!isOwnedZid) {
    return null;
  }

  return <FeedChatContainer zid={zid} />;
};
