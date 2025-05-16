import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Waypoint } from '../waypoint';
import classNames from 'classnames';
import moment from 'moment';
import { Message as MessageModel, MediaType, AdminMessageType, Media } from '../../store/messages';
import InvertedScroll from '../inverted-scroll';
import { MessagesFetchState } from '../../store/channels';
import { searchMentionableUsersForChannel } from '../../platform-apps/channels/util/api';
import './styles.scss';
import { ChatSkeleton } from './chat-skeleton';
import {
  createMessageGroups,
  filterAdminMessages,
  formatDayHeader,
  getConversationErrorMessage,
  getFailureErrorMessage,
  isUserOwnerOfMessage,
  processMessages,
} from './utils';
import { bemClassName } from '../../lib/bem';
import { useDispatch, useSelector } from 'react-redux';
import { useChannelSelector, useMessagesSelector, useUsersSelector } from '../../store/hooks';
import { compareDatesAsc } from '../../lib/date';
import { ChatMessage } from './chat-message';
import { openLightbox } from '../../store/dialogs';
import { AdminMessageContainer } from '../admin-message/container';
import { openMessageInfo } from '../../store/message-info';
import { toggleSecondarySidekick } from '../../store/group-management';
import { currentUserSelector } from '../../store/authentication/selectors';

const componentCn = bemClassName('chat-view');
const messagesCn = bemClassName('messages');
const messageCn = bemClassName('message');

interface ChatMessageGroups {
  [date: string]: MessageModel[];
}

export interface Properties {
  id: string;
  hasLoadedMessages: boolean;
  messagesFetchStatus: MessagesFetchState;
  className?: string;
  isOneOnOne: boolean;
  isSecondarySidekickOpen: boolean;
  onHiddenMessageInfoClick: () => void;
  onFetchMore: (timestamp: number) => void;
  onReload: () => void;
}

export const ChatView = React.forwardRef<InvertedScroll, Properties>(
  (
    {
      id,
      hasLoadedMessages,
      messagesFetchStatus,
      className,
      isOneOnOne,
      isSecondarySidekickOpen,
      onHiddenMessageInfoClick,
      onFetchMore,
      onReload,
    },
    ref
  ) => {
    const dispatch = useDispatch();

    const user = useSelector(currentUserSelector);
    const channel = useChannelSelector(id);
    const channelMessages = useMessagesSelector(channel?.messages || []);
    const channelOtherMembers = useUsersSelector(channel?.otherMembers || []);

    const { messages, mediaMessages } = useMemo(() => {
      return processMessages(channelMessages);
    }, [channelMessages]);

    const [rendered, setRendered] = useState(false);
    useEffect(() => {
      setRendered(true);
    }, []);

    const conversationErrorMessage = useMemo(() => {
      return getConversationErrorMessage(channel, channelOtherMembers);
    }, [
      channel,
      channelOtherMembers,
    ]);

    const failureDisplayMessage = useMemo(() => {
      return getFailureErrorMessage(hasLoadedMessages, channel?.name, channelOtherMembers[0]?.firstName);
    }, [hasLoadedMessages, channel?.name, channelOtherMembers]);

    const shouldRenderMessage = useCallback((message: MessageModel) => {
      return (
        !message.rootMessageId &&
        !message.isPost &&
        (!message.admin || message.admin?.type !== AdminMessageType.REACTION)
      );
    }, []);

    const sortMessages = useCallback((messagesToSort: MessageModel[]) => {
      return [...messagesToSort].sort((a, b) =>
        compareDatesAsc(new Date(a.createdAt).toISOString(), new Date(b.createdAt).toISOString())
      );
    }, []);

    const getOldestTimestamp = useCallback((messages: MessageModel[] = []): number => {
      return messages.reduce((previousTimestamp, message: any) => {
        return message.createdAt < previousTimestamp ? message.createdAt : previousTimestamp;
      }, Date.now());
    }, []);

    const fetchMore = useCallback(() => {
      if (channel?.hasMore) {
        const referenceTimestamp = getOldestTimestamp(channelMessages);
        onFetchMore(referenceTimestamp);
      }
    }, [
      channel?.hasMore,
      channelMessages,
      getOldestTimestamp,
      onFetchMore,
    ]);

    const messagesByDay = useMemo(() => {
      const filteredMessages = messages.filter(shouldRenderMessage);
      const sortedMessages = sortMessages(filteredMessages);
      return sortedMessages.reduce((prev, current) => {
        const createdAt = moment(current.createdAt);
        const startOfDay = createdAt.startOf('day').format();
        if (!prev[startOfDay]) {
          prev[startOfDay] = [];
        }
        prev[startOfDay].push(current);
        return prev;
      }, {} as ChatMessageGroups);
    }, [messages, shouldRenderMessage, sortMessages]);

    const openLightboxHandler = useCallback(
      (media: Media) => {
        const lightboxMedia = messages
          .filter(shouldRenderMessage)
          .map((message) => message.media || mediaMessages.get(message.id)?.media)
          .filter((m) => m && [MediaType.Image].includes(m.type))
          .reverse();

        const lightboxStartIndex = lightboxMedia.indexOf(media);

        dispatch(openLightbox({ media: lightboxMedia, startingIndex: lightboxStartIndex }));
      },
      [
        messages,
        shouldRenderMessage,
        dispatch,
        mediaMessages,
      ]
    );

    const openMessageInfoHandler = useCallback(
      (messageId: string) => {
        dispatch(openMessageInfo({ messageId }));

        if (!isSecondarySidekickOpen) {
          dispatch(toggleSecondarySidekick());
        }
      },
      [isSecondarySidekickOpen, dispatch]
    );

    const searchMentionableUsersHandler = useCallback(
      async (search: string) => {
        return searchMentionableUsersForChannel(search, channelOtherMembers);
      },
      [channelOtherMembers]
    );

    const filteredMessagesByDay = useMemo(() => filterAdminMessages(messagesByDay), [messagesByDay]);

    const messagesToRender = useMemo(() => {
      return Object.keys(filteredMessagesByDay).sort((a, b) => (a > b ? 1 : -1));
    }, [filteredMessagesByDay]);

    const renderMessageGroup = useCallback(
      (group: MessageModel[]) => {
        return group.map((message, index) => {
          if (message.isAdmin)
            return <AdminMessageContainer key={message.optimisticId || message.id} message={message} />;

          const isUserOwner = isUserOwnerOfMessage(message, user);
          const isUserOwnerOfParentMessage = isUserOwnerOfMessage(message.parentMessage, user);

          return (
            <ChatMessage
              key={message.id}
              message={message}
              isUserOwner={isUserOwner}
              isUserOwnerOfParentMessage={isUserOwnerOfParentMessage}
              renderIndex={index}
              showSenderAvatar={!isOneOnOne}
              channelId={id}
              groupLength={group.length}
              isOneOnOne={isOneOnOne}
              mediaMessages={mediaMessages}
              onImageClick={openLightboxHandler}
              onOpenMessageInfo={openMessageInfoHandler}
              getUsersForMentions={searchMentionableUsersHandler}
              onHiddenMessageInfoClick={onHiddenMessageInfoClick}
            />
          );
        });
      },
      [
        id,
        isOneOnOne,
        mediaMessages,
        onHiddenMessageInfoClick,
        openLightboxHandler,
        openMessageInfoHandler,
        searchMentionableUsersHandler,
        user,
      ]
    );

    return (
      <div className={classNames('channel-view', className)}>
        <InvertedScroll className='channel-view__inverted-scroll' isScrollbarHidden={isSecondarySidekickOpen} ref={ref}>
          <div className='channel-view__main'>
            {hasLoadedMessages && messagesFetchStatus === MessagesFetchState.MORE_IN_PROGRESS && (
              <div {...componentCn('scroll-skeleton')}>
                <ChatSkeleton conversationId={id} short />
              </div>
            )}
            {messages.length > 0 && messagesFetchStatus === MessagesFetchState.SUCCESS && (
              <div {...componentCn('infinite-scroll-waypoint')}>
                <Waypoint onEnter={fetchMore} />
              </div>
            )}
            {!hasLoadedMessages && messagesFetchStatus !== MessagesFetchState.FAILED && (
              <ChatSkeleton conversationId={id} />
            )}
            {messages.length > 0 && (
              <div {...messagesCn('container', rendered && 'rendered')}>
                {messagesToRender.map((day) => {
                  const groups = createMessageGroups(filteredMessagesByDay[day]);
                  return (
                    <Fragment key={day}>
                      <div {...messageCn('header')}>
                        <div {...messageCn('header-date')}>{formatDayHeader(day)}</div>
                      </div>
                      {groups.map(renderMessageGroup).flat()}
                    </Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {messagesFetchStatus === MessagesFetchState.FAILED && (
            <div {...componentCn('failure-message')}>
              {failureDisplayMessage}&nbsp;
              <span {...componentCn('try-reload')} onClick={onReload}>
                Try Reload
              </span>
            </div>
          )}

          {conversationErrorMessage && <div {...componentCn('error')}>{conversationErrorMessage}</div>}
        </InvertedScroll>
      </div>
    );
  }
);
