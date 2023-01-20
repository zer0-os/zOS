import React from 'react';
import { IconXClose, IconMinus } from '@zero-tech/zui/icons';
import classNames from 'classnames';
import { setActiveChannelId } from '../../../store/chat';
import { RootState } from '../../../store';
import { connectContainer } from '../../../store/redux-container';
import { ChannelViewContainer } from '../channel-view-container';

import './styles.scss';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  activeChannelId: RootState['chat']['activeChannelId'];
  setActiveChannelId: (activeChannelId: string) => void;
}

interface State {
  isFullScreen: boolean;
  isMinimized: boolean;
}

export class Container extends React.Component<Properties, State> {
  state = { isFullScreen: false, isMinimized: false };

  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeChannelId },
    } = state;

    return {
      activeChannelId,
    };
  }

  static mapActions(): Partial<Properties> {
    return { setActiveChannelId };
  }

  handleClose = () => {
    this.props.setActiveChannelId('');
  };

  componentDidUpdate(prevProps: Properties) {
    if (prevProps.activeChannelId !== this.props.activeChannelId) {
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

  render() {
    if (!this.props.activeChannelId) {
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
            <span className='direct-message-chat__title'>Title</span>
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
            channelId={this.props.activeChannelId}
            className='direct-message-chat__channel'
          />
        </div>
      </div>
    );
  }
}

export const DirectMessageChat = connectContainer<PublicProperties>(Container);
