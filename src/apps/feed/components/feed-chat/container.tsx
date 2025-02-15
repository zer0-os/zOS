import { FeedChatContainer } from './index';
import { useRouteMatch } from 'react-router-dom';

export const FeedChat = () => {
  const route = useRouteMatch<{ zid: string }>('/feed/:zid');
  const zid = route?.params?.zid;

  return <FeedChatContainer zid={zid} />;
};
