import React from 'react';
import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';
import { ChatViewContainer } from '../../../../components/chat-view-container/chat-view-container';
import { Channel, denormalize } from '../../../../store/channels';
import { MessageInput } from '../../../../components/message-input/container';
import { send as sendMessage } from '../../../../store/messages';
import { SendPayload as PayloadSendMessage } from '../../../../store/messages/saga';
import { searchMentionableUsersForChannel } from '../../../../platform-apps/channels/util/api';
import { Media } from '../../../../components/message-input/utils';
import { ErrorDialogContent } from '../../../../store/chat/types';
import { Panel, PanelBody, PanelHeader, PanelTitle } from '../../../../components/layout/panel';
import { InvertedScroll } from '../../../../components/inverted-scroll';
import classNames from 'classnames';
import styles from './styles.module.scss';

interface Properties {
  zid?: string;
  channel: Channel | null;
  activeConversationId: string | null;
  isJoiningConversation: boolean;
  isConversationsLoaded: boolean;
  joinRoomErrorContent: ErrorDialogContent;
  sendMessage: (payload: PayloadSendMessage) => void;
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
    } = state;

    const channel = denormalize(activeConversationId, state) || null;

    return {
      channel,
      activeConversationId,
      joinRoomErrorContent,
      isJoiningConversation,
      isConversationsLoaded,
    };
  }

  static mapActions(): Partial<Properties> {
    return {
      sendMessage,
    };
  }

  handleSendMessage = (message: string, mentionedUserIds: string[] = [], media: Media[] = []): void => {
    const { activeConversationId } = this.props;

    const payloadSendMessage = {
      channelId: activeConversationId,
      message,
      mentionedUserIds,
      files: media,
    };

    this.props.sendMessage(payloadSendMessage);

    if (this.chatViewContainerRef?.current) {
      this.chatViewContainerRef.current.scrollToBottom();
    }
  };

  searchMentionableUsers = async (search: string) => {
    return await searchMentionableUsersForChannel(
      this.props.activeConversationId,
      search,
      this.props.channel.otherMembers
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
          <Panel className={styles.Container}>
            <PanelHeader>
              <PanelTitle>Chat</PanelTitle>
            </PanelHeader>
            <PanelBody className={styles.Panel}>
              <InvertedScroll
                className={classNames('channel-view__inverted-scroll', styles.Scroll)}
                isScrollbarHidden={true}
              >
                <div className={styles.FeedChat}>
                  <div className={classNames('direct-message-chat', 'direct-message-chat--full-screen')}>
                    <div className='direct-message-chat__content'>
                      <div>
                        <ChatViewContainer
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
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </InvertedScroll>
            </PanelBody>
          </Panel>
        )}
      </>
    );
  }
}

export const FeedChatContainer = connectContainer<{ zid?: string }>(Container);
