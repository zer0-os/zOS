import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { IfAuthenticated } from '../authentication/if-authenticated';
import { IconButton, Icons } from '@zer0-os/zos-component-library';
import classNames from 'classnames';
import { AuthenticationState } from '../../store/authentication/types';
import { AppLayout, update as updateLayout } from '../../store/layout';
import { MessengerList } from '../messenger/list';

import './styles.scss';
import { denormalize } from '../../store/channels';

import './styles.scss';

enum Tabs {
  NETWORK,
  MESSAGES,
  NOTIFICATIONS,
}

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  user: AuthenticationState['user'];
  updateLayout: (layout: Partial<AppLayout>) => void;
  countAllUnreadMessages: number;
}

export interface State {
  isOpen: boolean;
  activeTab: Tabs;
}

export class Container extends React.Component<Properties, State> {
  state = { isOpen: true, activeTab: Tabs.MESSAGES };

  static mapState(state: RootState): Partial<Properties> {
    const directMessages = denormalize(state.channelsList.value, state).filter((channel) => Boolean(channel.isChannel));
    const countAllUnreadMessages = directMessages.reduce(
      (count, directMessage) => count + directMessage.unreadCount,
      0
    );
    const {
      authentication: { user },
    } = state;

    return {
      user,
      countAllUnreadMessages,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { updateLayout };
  }

  slideAnimationEnded = (): void => {
    if (!this.state.isOpen) {
      this.setState({ isOpen: false });
    }
  };

  clickTab(tab: Tabs): void {
    this.setState({
      activeTab: tab,
    });
  }

  handleSidekickPanel = (): void => {
    this.props.updateLayout({ isSidekickOpen: !this.state.isOpen });
    this.setState({ isOpen: !this.state.isOpen });
  };

  renderSidekickPanel(): JSX.Element {
    return (
      <div
        className='app-sidekick-panel__target'
        onClick={this.handleSidekickPanel}
      >
        <svg
          className='sidekick-panel-tab__tab'
          viewBox='0 0 16 104'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M4.03079 89.9538L11.9692 78.0462C14.5975 74.1038 16 69.4716 16 64.7334V51.5V39.2666C16 34.5284 14.5975 29.8962 11.9692 25.9538L4.03079 14.0462C1.40251 10.1038 0 5.47158 0 0.733383V51.5V103.267C0 98.5284 1.40251 93.8962 4.03079 89.9538Z' />
        </svg>
        <div className='sidekick-panel-tab__icon'>
          <span className='sidekick-panel-tab__icon-item' />
          <span className='sidekick-panel-tab__icon-item' />
          <span className='sidekick-panel-tab__icon-item' />
        </div>
      </div>
    );
  }

  renderMessageTab() {
    if (this.props.countAllUnreadMessages > 0) {
      return (
        <div
          className='sidekick__tab-notifications sidekick__tab-notifications--unread-messages'
          onClick={this.clickTab.bind(this, Tabs.MESSAGES)}
        >
          {this.props.countAllUnreadMessages}
        </div>
      );
    } else {
      return (
        <IconButton
          className='sidekick__tabs-messages'
          icon={Icons.Messages}
          onClick={this.clickTab.bind(this, Tabs.MESSAGES)}
        />
      );
    }
  }

  renderTabs(): JSX.Element {
    return (
      <div className='sidekick__tabs'>
        <IconButton
          className='sidekick__tabs-network'
          icon={Icons.Network}
          onClick={this.clickTab.bind(this, Tabs.NETWORK)}
        />
        {this.renderMessageTab()}
        <IconButton
          className='sidekick__tabs-notifications'
          icon={Icons.Notifications}
          onClick={this.clickTab.bind(this, Tabs.NOTIFICATIONS)}
        />
      </div>
    );
  }

  renderTabContent(): JSX.Element {
    switch (this.state.activeTab) {
      case Tabs.NETWORK:
        return <div className='sidekick__tab-content--network'>NETWORK</div>;
      case Tabs.MESSAGES:
        return (
          <div className='sidekick__tab-content--messages'>
            <MessengerList />
          </div>
        );
      case Tabs.NOTIFICATIONS:
        return <div className='sidekick__tab-content--notifications'>NOTIFICATIONS</div>;
      default:
        return null;
    }
  }

  render() {
    return (
      <IfAuthenticated showChildren>
        <div
          className={classNames('sidekick', this.props.className, { 'sidekick__slide-out': !this.state.isOpen })}
          onAnimationEnd={this.slideAnimationEnded}
        >
          {this.renderSidekickPanel()}
          <div className='sidekick-panel'>{this.renderTabs()}</div>
          <div className='sidekick__tab-content'>{this.renderTabContent()}</div>
        </div>
      </IfAuthenticated>
    );
  }
}

export const Sidekick = connectContainer<PublicProperties>(Container);
