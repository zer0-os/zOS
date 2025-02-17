import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { Channel, DefaultRoomLabels } from '../../store/channels';
import { denormalizeConversations } from '../../store/channels-list';
import { IconBell1 } from '@zero-tech/zui/icons';
import { NotificationItem } from './notification-item';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { openNotificationConversation } from '../../store/notifications';
import { ToggleGroup } from '@zero-tech/zui/components/ToggleGroup';
import { Panel, PanelBody, PanelHeader, PanelTitle } from '../layout/panel';

import styles from './styles.module.scss';

enum Tab {
  All = 'all',
  Highlights = 'highlights',
  Muted = 'muted',
}

const MESSAGES: Record<Tab, string> = {
  [Tab.All]: 'No new notifications',
  [Tab.Highlights]: 'No new highlights',
  [Tab.Muted]: 'No notifications in muted conversations',
};

const TABS: { key: Tab; label: string }[] = [
  { key: Tab.All, label: 'All' },
  { key: Tab.Highlights, label: 'Highlights' },
  { key: Tab.Muted, label: 'Muted' },
];

export interface PublicProperties {}

interface State {
  selectedTab: Tab;
}

export interface Properties extends PublicProperties {
  conversations: Channel[];
  isConversationsLoaded: boolean;

  openNotificationConversation: (roomId: string) => void;
}

export class Container extends React.Component<Properties, State> {
  state = {
    selectedTab: Tab.All,
  };

  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { isConversationsLoaded },
    } = state;

    const conversations = denormalizeConversations(state).filter(
      (conversation) =>
        (conversation.unreadCount.total > 0 || conversation.unreadCount?.highlight > 0) &&
        !conversation.labels?.includes(DefaultRoomLabels.ARCHIVED)
    );

    return {
      conversations,
      isConversationsLoaded,
    };
  }

  static mapActions(): Partial<Properties> {
    return {
      openNotificationConversation,
    };
  }

  getFilteredConversations() {
    const { conversations } = this.props;

    switch (this.state.selectedTab) {
      case Tab.Highlights:
        return conversations.filter(
          (conversation) =>
            conversation.unreadCount?.highlight > 0 &&
            !conversation.labels?.includes(DefaultRoomLabels.ARCHIVED) &&
            !conversation.labels?.includes(DefaultRoomLabels.MUTE)
        );
      case Tab.Muted:
        return conversations.filter(
          (conversation) =>
            conversation.labels?.includes(DefaultRoomLabels.MUTE) &&
            !conversation.labels?.includes(DefaultRoomLabels.ARCHIVED) &&
            (conversation.unreadCount?.total > 0 || conversation.unreadCount?.highlight > 0)
        );
      case Tab.All:
      default:
        return conversations.filter(
          (conversation) =>
            !conversation.labels?.includes(DefaultRoomLabels.ARCHIVED) &&
            !conversation.labels?.includes(DefaultRoomLabels.MUTE)
        );
    }
  }
  onNotificationClick = (roomId: string) => {
    this.props.openNotificationConversation(roomId);
  };

  renderHeaderIcon() {
    return <IconBell1 className={styles.HeaderIcon} size={18} isFilled />;
  }

  renderTabs() {
    return (
      <ToggleGroup
        data-testid='toggle-group'
        className={styles.Tabs}
        options={TABS}
        variant='default'
        onSelectionChange={(selected) => this.setState({ selectedTab: selected as Tab })}
        selection={this.state.selectedTab}
        selectionType='single'
        isRequired
      />
    );
  }

  renderNotifications(conversations: Channel[]) {
    return conversations.flatMap((conversation) => {
      const notifications = [];

      if (this.state.selectedTab === Tab.Highlights) {
        if (conversation.unreadCount?.highlight > 0) {
          notifications.push(
            <li key={`${conversation.id}-highlight`}>
              <NotificationItem conversation={conversation} onClick={this.onNotificationClick} type='highlight' />
            </li>
          );
        }
      } else {
        if (conversation.unreadCount?.total > 0) {
          notifications.push(
            <li key={`${conversation.id}-total`}>
              <NotificationItem conversation={conversation} onClick={this.onNotificationClick} type='total' />
            </li>
          );
        }
        if (conversation.unreadCount?.highlight > 0) {
          notifications.push(
            <li key={`${conversation.id}-highlight`}>
              <NotificationItem conversation={conversation} onClick={this.onNotificationClick} type='highlight' />
            </li>
          );
        }
      }

      return notifications;
    });
  }

  renderNoNotifications() {
    const message = MESSAGES[this.state.selectedTab];

    return <div className={styles.NoNotifications}>{message}</div>;
  }

  renderLoading() {
    return (
      <div className={styles.LoadingContainer}>
        <Spinner />
      </div>
    );
  }

  render() {
    const { isConversationsLoaded } = this.props;
    const filteredConversations = this.getFilteredConversations();

    const isEmptyState = filteredConversations.length === 0 && isConversationsLoaded;
    const isLoadingState = !isConversationsLoaded;

    return (
      <Panel className={styles.Container}>
        <PanelHeader>
          <PanelTitle>Notifications</PanelTitle>
        </PanelHeader>
        <PanelBody className={styles.Body}>
          {this.renderTabs()}
          <ol className={styles.Notifications}>{!isEmptyState && this.renderNotifications(filteredConversations)}</ol>

          {isEmptyState && this.renderNoNotifications()}
          {isLoadingState && this.renderLoading()}
        </PanelBody>
      </Panel>
    );
  }
}

export const NotificationsFeed = connectContainer<PublicProperties>(Container);
