import { FeedChatContainer } from './index';
import { JoinChannel } from '../join-channel';
import { useRouteMatch } from 'react-router-dom';
import { useChannelMembership } from '../../hooks/useChannelMembership';
import { Panel, PanelHeader, PanelBody, PanelTitle } from '../../../../components/layout/panel';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator/Spinner';
import { ConversationActionsContainer } from '../../../../components/messenger/conversation-actions/container';

import styles from './styles.module.scss';

export const FeedChat = () => {
  const route = useRouteMatch<{ zid: string }>('/feed/:zid');
  const zid = route?.params?.zid;
  const { isMember, isLoading, channelData } = useChannelMembership(zid);

  if (!zid) {
    return null;
  }

  const tokenRequirements = channelData?.tokenSymbol
    ? {
        symbol: channelData.tokenSymbol,
        amount: channelData.tokenAmount,
        address: channelData.tokenAddress,
      }
    : undefined;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={styles.Loading}>
          <Spinner />
        </div>
      );
    }

    if (isMember) {
      return <FeedChatContainer zid={zid} />;
    }

    if (channelData?.isLegacy && tokenRequirements === undefined) {
      return (
        <div className={styles.Loading}>
          <Spinner />
          <div className={styles.SyncingMessage}>Syncing channel... please wait</div>
        </div>
      );
    }

    // If user is not a member, show join channel component
    return <JoinChannel zid={zid} isLegacyChannel={!channelData?.isLegacy} tokenRequirements={tokenRequirements} />;
  };

  return (
    <Panel className={styles.Container}>
      <PanelHeader className={styles.PanelHeader}>
        <PanelTitle className={styles.PanelTitle}>0://{zid}</PanelTitle>
        {isMember && <ConversationActionsContainer />}
      </PanelHeader>
      <PanelBody className={styles.Panel}>{renderContent()}</PanelBody>
    </Panel>
  );
};
