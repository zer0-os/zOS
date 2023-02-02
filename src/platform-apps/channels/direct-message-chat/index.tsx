import React from 'react';
import { IconXClose, IconMinus } from '@zero-tech/zui/icons';
import classNames from 'classnames';
import { setActiveDirectMessageId } from '../../../store/direct-messages';
import { RootState } from '../../../store';
import { connectContainer } from '../../../store/redux-container';
import { ChannelViewContainer } from '../channel-view-container';
import Tooltip from '../../../components/tooltip';

import './styles.scss';
import { DirectMessage } from '../../../store/direct-messages/types';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  activeDirectMessageId: string;
  setActiveDirectMessageId: (activeDirectMessageId: string) => void;
  directMessage: DirectMessage;
}

interface State {
  isFullScreen: boolean;
  isMinimized: boolean;
}

export class Container extends React.Component<Properties, State> {
  state = { isFullScreen: false, isMinimized: false };

  static mapState(state: RootState): Partial<Properties> {
    const {
      directMessages: { activeDirectMessageId, list },
    } = state;

    return {
      activeDirectMessageId,
      directMessage: list.find((directMessage) => directMessage.id === activeDirectMessageId),
    };
  }

  static mapActions(): Partial<Properties> {
    return { setActiveDirectMessageId };
  }

  handleClose = (): void => {
    this.props.setActiveDirectMessageId('');
  };

  componentDidUpdate(prevProps: Properties): void {
    if (prevProps.activeDirectMessageId !== this.props.activeDirectMessageId) {
      this.setState({ isFullScreen: false, isMinimized: false });
    }
  }

  handleHeaderClick = (): void => {
    this.setState((state) => ({ isMinimized: false, isFullScreen: state.isMinimized ? false : !state.isFullScreen }));
  };

  handleMinimizeClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    this.setState((state) => ({ isMinimized: !state.isMinimized, isFullScreen: false }));
  };

  renderTitle() {
    const { directMessage } = this.props;

    if (!directMessage) return '';

    const otherMembers = directMessage.otherMembers.map((member) => member.firstName).join(', ');

    if (directMessage.name) {
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
          <div>{directMessage.name}</div>
        </Tooltip>
      );
    }

    return otherMembers;
  }

  render() {
    if (!this.props.activeDirectMessageId) {
      return null;
    }

    return (
      <div
        className={classNames('direct-message-chat', {
          'direct-message-chat--transition': this.state.isFullScreen !== null || this.state.isMinimized,
          'direct-message-chat--full-screen': this.state.isFullScreen,
          'direct-message-chat--minimized': this.state.isMinimized,
        })}
      >
        <div className='direct-message-chat__content'>
          <div
            className='direct-message-chat__header direct-message-chat__header'
            onClick={this.handleHeaderClick}
          >
            <span className='direct-message-chat__title'>{this.renderTitle()}</span>
            <button
              className='button-reset direct-message-chat__minimize-button'
              onClick={this.handleMinimizeClick}
            >
              <IconMinus />
            </button>
            <button
              className='button-reset direct-message-chat__close-button'
              onClick={this.handleClose}
            >
              <IconXClose />
            </button>
          </div>

          <ChannelViewContainer
            channelId={this.props.activeDirectMessageId}
            className='direct-message-chat__channel'
            isDirectMessage
          />
        </div>
      </div>
    );
  }
}

export const DirectMessageChat = connectContainer<PublicProperties>(Container);
