import React from 'react';
import { IconExpand1, IconMinus, IconUsers1, IconXClose, IconCollapse1 } from '@zero-tech/zui/icons';
import classNames from 'classnames';
import { setactiveConversationId } from '../../../store/chat';
import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import Tooltip from '../../tooltip';
import { Channel, denormalize } from '../../../store/channels';
import { ChatViewContainer } from '../../chat-view-container/chat-view-container';
import { getProvider } from '../../../lib/cloudinary/provider';
import { otherMembersToString } from '../../../platform-apps/channels/util';

import './styles.scss';
import { enterFullScreenMessenger, exitFullScreenMessenger } from '../../../store/layout';
import { isCustomIcon } from '../list/utils/utils';
import { IconButton } from '@zero-tech/zui/components';
import { featureFlags } from '../../../lib/feature-flags';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  activeConversationId: string;
  setactiveConversationId: (activeDirectMessageId: string) => void;
  directMessage: Channel;
  isFullScreen: boolean;
  allowCollapse: boolean;
  enterFullScreenMessenger: () => void;
  exitFullScreenMessenger: () => void;
}

interface State {
  isMinimized: boolean;
}

export class Container extends React.Component<Properties, State> {
  state = { isMinimized: false };

  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId },
      layout,
      authentication: { user },
    } = state;

    const directMessage = denormalize(activeConversationId, state);

    let allowCollapse = false;
    if (featureFlags.internalUsage) {
      allowCollapse = layout.value?.isMessengerFullScreen && user?.data?.isAMemberOfWorlds;
    }
    return {
      activeConversationId,
      directMessage,
      isFullScreen: layout.value?.isMessengerFullScreen,
      allowCollapse,
    };
  }

  static mapActions(): Partial<Properties> {
    return {
      setactiveConversationId,
      enterFullScreenMessenger,
      exitFullScreenMessenger,
    };
  }

  handleClose = (): void => {
    this.props.setactiveConversationId('');
  };

  componentDidUpdate(prevProps: Properties): void {
    if (prevProps.activeConversationId !== this.props.activeConversationId) {
      this.setState({ isMinimized: false });
    }
  }

  handleMinimizeClick = (): void => {
    this.setState((state) => ({ isMinimized: !state.isMinimized }));
  };

  handleMaximize = (): void => this.props.enterFullScreenMessenger();
  handleDockRight = (): void => this.props.exitFullScreenMessenger();

  renderTitle() {
    const { directMessage } = this.props;

    if (!directMessage) return '';

    const otherMembers = otherMembersToString(directMessage.otherMembers);

    return (
      <Tooltip
        placement='left'
        overlay={otherMembers}
        align={{
          offset: [
            -10,
            0,
          ],
        }}
        className='direct-message-chat__user-tooltip'
        key={directMessage.id}
      >
        <div>{directMessage.name || otherMembers}</div>
      </Tooltip>
    );
  }

  renderSubTitle() {
    if (!this.props.directMessage?.otherMembers) {
      return '';
    } else {
      return this.anyOthersOnline() ? 'Online' : 'Offline';
    }
  }

  avatarUrl() {
    if (!this.props.directMessage?.otherMembers) {
      return '';
    }

    if (this.isOneOnOne() && this.props.directMessage.otherMembers[0]) {
      return this.props.directMessage.otherMembers[0].profileImage;
    }

    if (isCustomIcon(this.props.directMessage?.icon)) {
      return this.props.directMessage?.icon;
    }

    return '';
  }

  isOneOnOne() {
    return this.props.directMessage?.isOneOnOne;
  }

  avatarStatus() {
    if (!this.props.directMessage?.otherMembers) {
      return 'unknown';
    }

    return this.anyOthersOnline() ? 'online' : 'offline';
  }

  anyOthersOnline() {
    return this.props.directMessage.otherMembers.some((m) => m.isOnline);
  }

  render() {
    if (!this.props.activeConversationId || !this.props.directMessage) {
      return null;
    }

    return (
      <div
        className={classNames('direct-message-chat', {
          'direct-message-chat--transition': this.props.isFullScreen !== null || this.state.isMinimized,
          'direct-message-chat--full-screen': this.props.isFullScreen,
          'direct-message-chat--minimized': this.state.isMinimized,
        })}
      >
        <div className='direct-message-chat__content'>
          {!this.props.isFullScreen && (
            <div className='direct-message-chat__title-bar'>
              <IconButton onClick={this.handleMaximize} Icon={IconExpand1} size='x-small' />
              <IconButton onClick={this.handleMinimizeClick} Icon={IconMinus} size='x-small' />
              <IconButton onClick={this.handleClose} Icon={IconXClose} size='x-small' />
            </div>
          )}

          <div className='direct-message-chat__header'>
            <span>
              <div
                style={{
                  backgroundImage: `url(${getProvider().getSourceUrl(this.avatarUrl())})`,
                }}
                className={classNames(
                  'direct-message-chat__header-avatar',
                  `direct-message-chat__header-avatar--${this.avatarStatus()}`
                )}
              >
                {!this.isOneOnOne() && <IconUsers1 size={16} />}
              </div>
            </span>
            <span className='direct-message-chat__description'>
              <div className='direct-message-chat__title'>{this.renderTitle()}</div>
              <div className='direct-message-chat__subtitle'>{this.renderSubTitle()}</div>
            </span>

            {this.props.allowCollapse && (
              <div>
                <IconButton onClick={this.handleDockRight} Icon={IconCollapse1} size='small' />
              </div>
            )}
          </div>

          <ChatViewContainer
            key={this.props.directMessage.optimisticId || this.props.directMessage.id} // Render new component for a new chat
            channelId={this.props.activeConversationId}
            className='direct-message-chat__channel'
            isDirectMessage
            showSenderAvatar={!this.isOneOnOne()}
          />
        </div>
      </div>
    );
  }
}

export const MessengerChat = connectContainer<PublicProperties>(Container);
