import { FeedChatContainer } from './index';
import { JoinChannel } from '../join-channel';
import { useRouteMatch } from 'react-router-dom';
import { useJoinChannelInfo } from '../join-channel/hooks/useJoinChannelInfo';

export const FeedChat = () => {
  const route = useRouteMatch<{ zid: string }>('/feed/:zid');
  const zid = route?.params?.zid;
  const { channelInfo, isLoading } = useJoinChannelInfo(zid);

  if (!zid) {
    return null;
  }

  if (channelInfo?.isMember) {
    return <FeedChatContainer zid={zid} />;
  }

  if (!channelInfo?.isMember && !isLoading) {
    return (
      <JoinChannel
        zid={zid}
        isLegacyChannel={!channelInfo?.isTokenGated}
        tokenRequirements={channelInfo?.tokenRequirements}
      />
    );
  }

  return null;
};
