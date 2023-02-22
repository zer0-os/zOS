import React from 'react';
import { IconMinus, IconUsers1, IconXClose } from '@zero-tech/zui/icons';
import classNames from 'classnames';
import { setActiveMessengerId } from '../../../store/chat';
import { RootState } from '../../../store';
import { connectContainer } from '../../../store/redux-container';
import Tooltip from '../../tooltip';
import { IconButton } from '../../icon-button';
import { Channel, denormalize } from '../../../store/channels';
import { ChatViewContainer } from '../../chat-view-container/chat-view-container';
import { provider as imageProvider } from '../../../lib/cloudinary/provider';
import { otherMembersToString } from '../../../platform-apps/channels/util';

import './styles.scss';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  activeMessengerId: string;
  setActiveMessengerId: (activeDirectMessageId: string) => void;
  directMessage: Channel;
}

interface State {
  isFullScreen: boolean;
  isMinimized: boolean;
}

export class Container extends React.Component<Properties, State> {
  state = { isFullScreen: false, isMinimized: false };

  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeMessengerId },
    } = state;

    const directMessage = denormalize(activeMessengerId, state);

    return {
      activeMessengerId,
      directMessage,
    };
  }

  static mapActions(): Partial<Properties> {
    return { setActiveMessengerId };
  }

  handleClose = (): void => {
    this.props.setActiveMessengerId('');
  };

  componentDidUpdate(prevProps: Properties): void {
    if (prevProps.activeMessengerId !== this.props.activeMessengerId) {
      this.setState({ isFullScreen: false, isMinimized: false });
    }
  }

  handleHeaderClick = (): void => {
    this.setState((state) => ({ isMinimized: false, isFullScreen: state.isMinimized ? false : !state.isFullScreen }));
  };

  handleMinimizeClick = (): void => {
    this.setState((state) => ({ isMinimized: !state.isMinimized, isFullScreen: false }));
  };

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

    if (this.isOneOnOne()) {
      return this.props.directMessage.otherMembers[0].profileImage;
    }
    return '';
  }

  isOneOnOne() {
    return this.props.directMessage?.otherMembers?.length === 1;
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
    if (!this.props.activeMessengerId) {
      return null;
    }

    return (
      <div
        className={classNames('direct-message-chat', {
          'direct-message-chat--transition': this.state.isFullScreen !== null || this.state.isMinimized,
          'direct-message-chat--full-screen': this.state.isFullScreen,
          'direct-message-chat--minimized': this.state.isMinimized,
          'direct-message-chat--one-on-one': this.isOneOnOne(),
        })}
      >
        <div className='direct-message-chat__content'>
          <div
            className='direct-message-chat__title-bar'
            onClick={this.handleHeaderClick}
          >
            <IconButton
              onClick={this.handleMinimizeClick}
              Icon={IconMinus}
              size={12}
            />
            <IconButton
              onClick={this.handleClose}
              Icon={IconXClose}
              size={12}
            />
          </div>

          <div className='direct-message-chat__header'>
            <span>
              <div
                style={{
                  backgroundImage: `url(${imageProvider.getSourceUrl(this.avatarUrl())})`,
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
          </div>

          <ChatViewContainer
            channelId={this.props.activeMessengerId}
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
