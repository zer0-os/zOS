import { useEffect, useCallback, useMemo, forwardRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import { fetch as fetchMessages, syncMessages } from '../../store/messages';
import { ChatView } from './chat-view';
import { Payload as PayloadFetchMessages, SyncMessagesPayload } from '../../store/messages/saga';
import { openCreateBackupDialog, openRestoreBackupDialog } from '../../store/matrix';
import { isOneOnOne as isOneOnOneUtil } from '../../store/channels-list/utils';
import { useChannelSelector } from '../../store/hooks';
import { currentUserSelector } from '../../store/authentication/selectors';
import { backupExistsSelector } from '../../store/matrix/selectors';
import InvertedScroll from '../inverted-scroll';
import { usePrevious } from '../../lib/hooks/usePrevious';
import { isMemberPanelOpenSelector } from '../../store/panels/selectors';

export interface PublicProperties {
  channelId: string;
  className?: string;
}

export const ChatViewContainer = forwardRef<InvertedScroll, PublicProperties>((props, ref) => {
  const { channelId, className } = props;

  const dispatch = useDispatch();

  const user = useSelector(currentUserSelector);
  const isSecondarySidekickOpen = useSelector(isMemberPanelOpenSelector);
  const backupExists = useSelector(backupExistsSelector);

  const channel = useChannelSelector(channelId);

  const dispatchFetchMessages = useCallback(
    (payload: PayloadFetchMessages) => dispatch(fetchMessages(payload)),
    [dispatch]
  );
  const dispatchSyncMessages = useCallback(
    (payload: SyncMessagesPayload) => dispatch(syncMessages(payload)),
    [dispatch]
  );

  const dispatchOpenCreateBackupDialog = useCallback(() => dispatch(openCreateBackupDialog()), [dispatch]);
  const dispatchOpenRestoreBackupDialog = useCallback(() => dispatch(openRestoreBackupDialog()), [dispatch]);

  useEffect(() => {
    if (channelId && user) {
      if (!channel?.hasLoadedMessages) {
        dispatchFetchMessages({ channelId });
      } else {
        dispatchSyncMessages({ channelId });
      }
    }
  }, [
    channelId,
    user,
    channel?.hasLoadedMessages,
    dispatchFetchMessages,
    dispatchSyncMessages,
  ]);

  const fetchMoreHandler = useCallback(
    (timestamp: number): void => {
      dispatchFetchMessages({ channelId, referenceTimestamp: timestamp });
    },
    [dispatchFetchMessages, channelId]
  );

  const reloadHandler = useCallback(() => {
    dispatchFetchMessages({ channelId });
  }, [dispatchFetchMessages, channelId]);

  const prevChannelId = usePrevious(channelId);
  useEffect(() => {
    if (channelId && prevChannelId && channelId !== prevChannelId && user) {
      dispatchFetchMessages({ channelId });
    }
  }, [
    channelId,
    prevChannelId,
    user,
    dispatchFetchMessages,
  ]);

  const handleHiddenMessageInfoClick = useCallback(() => {
    if (!backupExists) {
      dispatchOpenCreateBackupDialog();
    } else {
      dispatchOpenRestoreBackupDialog();
    }
  }, [backupExists, dispatchOpenCreateBackupDialog, dispatchOpenRestoreBackupDialog]);

  const isOneOnOne = useMemo(() => (channel ? isOneOnOneUtil(channel) : false), [channel]);

  if (!channel) return null;

  return (
    <>
      <ChatView
        className={classNames(className)}
        id={channel.id}
        ref={ref}
        messagesFetchStatus={channel.messagesFetchStatus}
        hasLoadedMessages={channel.hasLoadedMessages ?? false}
        onFetchMore={fetchMoreHandler}
        onReload={reloadHandler}
        isOneOnOne={isOneOnOne}
        isSecondarySidekickOpen={isSecondarySidekickOpen}
        onHiddenMessageInfoClick={handleHiddenMessageInfoClick}
      />
    </>
  );
});
