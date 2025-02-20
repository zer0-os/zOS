import React from 'react';
import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';
import { ChatViewContainer } from '../../../../components/chat-view-container/chat-view-container';
import { validateFeedChat } from '../../../../store/chat';
import { Channel, denormalize, onRemoveReply } from '../../../../store/channels';
import { MessageInput } from '../../../../components/message-input/container';
import { send as sendMessage } from '../../../../store/messages';
import { SendPayload as PayloadSendMessage } from '../../../../store/messages/saga';
import { searchMentionableUsersForChannel } from '../../../../platform-apps/channels/util/api';
import { Media } from '../../../../components/message-input/utils';
import { config } from '../../../../config';
import { ErrorDialogContent } from '../../../../store/chat/types';
import { Panel, PanelBody, PanelHeader, PanelTitle } from '../../../../components/layout/panel';
import { InvertedScroll } from '../../../../components/inverted-scroll';
import { getOtherMembersTypingDisplayJSX } from '../../../../components/messenger/lib/utils';
import { rawChannelSelector } from '../../../../store/channels/saga';
import { IconButton } from '@zero-tech/zui/components/IconButton';
import { IconChevronLeft, IconChevronRight } from '@zero-tech/zui/icons';
import { toggleSecondarySidekick } from '../../../../store/group-management';
import { MembersSidekick } from '../../../../components/sidekick/variants/members-sidekick';

import classNames from 'classnames';
import styles from './styles.module.scss';

export interface PublicProperties {
  zid?: string;
}

export interface Properties extends PublicProperties {
  channel: Channel;
  activeConversationId: string;
  isJoiningConversation: boolean;
  isConversationsLoaded: boolean;
  joinRoomErrorContent: ErrorDialogContent;
  otherMembersTypingInRoom: string[];
  isSecondarySidekickOpen: boolean;
  validateFeedChat: (id: string) => void;
  onRemoveReply: () => void;
  sendMessage: (payload: PayloadSendMessage) => void;
  toggleSecondarySidekick: () => void;
}

export class Container extends React.Component<Properties> {
  chatViewContainerRef = null;

  constructor(props: Properties) {
    super(props);
    this.chatViewContainerRef = React.createRef();
  }

  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId, joinRoomErrorContent, isJoiningConversation, isConversationsLoaded },
      groupManagement,
    } = state;

    const channel = denormalize(activeConversationId, state);
    const rawChannel = rawChannelSelector(activeConversationId)(state);

    return {
      channel,
      activeConversationId,
      joinRoomErrorContent,
      isJoiningConversation,
      isConversationsLoaded,
      otherMembersTypingInRoom: rawChannel?.otherMembersTyping || [],
      isSecondarySidekickOpen: groupManagement.isSecondarySidekickOpen,
    };
  }

  static mapActions(): Partial<Properties> {
    return {
      sendMessage,
      onRemoveReply,
      toggleSecondarySidekick,
      validateFeedChat: (id: string) => validateFeedChat({ id }),
    };
  }

  componentDidMount(): void {
    if (this.props.zid) {
      const roomAlias = `${this.props.zid}:${config.matrixHomeServerName}`;
      this.props.validateFeedChat(roomAlias);
    }
  }

  componentDidUpdate(prevProps: Properties): void {
    if (this.props.zid !== prevProps.zid) {
      if (this.props.zid) {
        const roomAlias = `${this.props.zid}:${config.matrixHomeServerName}`;
        this.props.validateFeedChat(roomAlias);
      }
    }
  }

  isNotEmpty = (message: string): boolean => {
    return !!message && message.trim() !== '';
  };

  searchMentionableUsers = async (search: string) => {
    return await searchMentionableUsersForChannel(
      this.props.activeConversationId,
      search,
      this.props.channel.otherMembers
    );
  };

  handleSendMessage = (message: string, mentionedUserIds: string[] = [], media: Media[] = []): void => {
    const { activeConversationId } = this.props;

    const payloadSendMessage = {
      channelId: activeConversationId,
      message,
      mentionedUserIds,
      parentMessage: this.props.channel.reply,
      files: media,
    };

    this.props.sendMessage(payloadSendMessage);

    if (this.isNotEmpty(message)) {
      this.props.onRemoveReply();
    }

    if (this.chatViewContainerRef?.current) {
      this.chatViewContainerRef.current.scrollToBottom();
    }
  };

  renderTypingIndicators = () => {
    const { otherMembersTypingInRoom } = this.props;
    const text = getOtherMembersTypingDisplayJSX(otherMembersTypingInRoom);
    return <div className='direct-message-chat__typing-indicator'>{text}</div>;
  };

  toggleSidekick = () => {
    this.props.toggleSecondarySidekick();
  };

  renderHeader = () => {
    return (
      <PanelHeader className={styles.PanelHeader} toggleSidekick={this.toggleSidekick}>
        <PanelTitle>Chat</PanelTitle>
        <IconButton
          className={classNames(styles.GroupButton, this.props.isSecondarySidekickOpen && 'is-active')}
          Icon={this.props.isSecondarySidekickOpen ? IconChevronRight : IconChevronLeft}
          size={32}
          onClick={this.toggleSidekick}
          isFilled
        />
      </PanelHeader>
    );
  };

  renderBody = () => {
    return (
      <PanelBody className={styles.Panel}>
        <InvertedScroll className={classNames('channel-view__inverted-scroll', styles.Scroll)} isScrollbarHidden={true}>
          <div className={styles.FeedChat}>
            <div className={classNames('direct-message-chat', 'direct-message-chat--full-screen')}>
              <div className='direct-message-chat__content'>
                <div>
                  <ChatViewContainer
                    key={this.props.channel.optimisticId || this.props.channel.id} // Render new component for a new chat
                    channelId={this.props.activeConversationId}
                    showSenderAvatar={true}
                    ref={this.chatViewContainerRef}
                    className='direct-message-chat__channel'
                  />

                  <div className='direct-message-chat__footer-position'>
                    <div className='direct-message-chat__footer'>
                      <div className={styles.FeedChatMessageInput}>
                        <MessageInput
                          id={this.props.activeConversationId}
                          onSubmit={this.handleSendMessage}
                          getUsersForMentions={this.searchMentionableUsers}
                          reply={this.props.channel?.reply}
                          onRemoveReply={this.props.onRemoveReply}
                        />
                        {this.renderTypingIndicators()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </InvertedScroll>
      </PanelBody>
    );
  };

  render() {
    const shouldRender = !!(
      this.props.zid &&
      this.props.channel &&
      this.props.activeConversationId &&
      !this.props.joinRoomErrorContent &&
      !this.props.isJoiningConversation &&
      this.props.isConversationsLoaded
    );

    return (
      <>
        {shouldRender && (
          <>
            <Panel className={styles.Container}>
              {this.renderHeader()} {this.renderBody()}
            </Panel>
            <MembersSidekick className={styles.MembersSidekick} />
          </>
        )}
      </>
    );
  }
}

export const FeedChatContainer = connectContainer<PublicProperties>(Container);
