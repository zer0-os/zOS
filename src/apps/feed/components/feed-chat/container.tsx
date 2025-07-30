import { FeedChatContainer } from './index';
import { JoinChannel } from '../join-channel';
import { useRouteMatch } from 'react-router-dom';
import { useJoinChannelInfo } from '../join-channel/hooks/useJoinChannelInfo';
import { Panel, PanelHeader, PanelBody, PanelTitle } from '../../../../components/layout/panel';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator/Spinner';
import { ConversationActionsContainer } from '../../../../components/messenger/conversation-actions/container';

import styles from './styles.module.scss';

export const FeedChat = () => {
  const route = useRouteMatch<{ zid: string }>('/feed/:zid');
  const zid = route?.params?.zid;
  const { channelInfo, isLoading } = useJoinChannelInfo(zid);

  if (!zid) {
    return null;
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={styles.Loading}>
          <Spinner />
        </div>
      );
    }

    if (channelInfo?.isMember) {
      return <FeedChatContainer zid={zid} />;
    }

    return (
      <JoinChannel
        zid={zid}
        isLegacyChannel={!channelInfo?.isTokenGated}
        tokenRequirements={channelInfo?.tokenRequirements}
      />
    );
  };

  return (
    <Panel className={styles.Container}>
      <PanelHeader className={styles.PanelHeader}>
        <PanelTitle className={styles.PanelTitle}>0://{zid}</PanelTitle>
        {!isLoading && channelInfo?.isMember && <ConversationActionsContainer />}
      </PanelHeader>
      <PanelBody className={styles.Panel}>{renderContent()}</PanelBody>
    </Panel>
  );
};
