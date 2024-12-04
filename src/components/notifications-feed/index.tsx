import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { Channel, DefaultRoomLabels } from '../../store/channels';
import { denormalizeConversations } from '../../store/channels-list';
import { Header } from '../header';
import { IconBell1 } from '@zero-tech/zui/icons';
import { NotificationItem } from './notification-item';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { openNotificationConversation } from '../../store/notifications';

import styles from './styles.module.scss';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  conversations: Channel[];
  isConversationsLoaded: boolean;

  openNotificationConversation: (roomId: string) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { isConversationsLoaded },
    } = state;

    const conversations = denormalizeConversations(state).filter(
      (conversation) =>
        (conversation.unreadCount.total > 0 || conversation.unreadCount?.highlight > 0) &&
        !conversation.labels?.includes(DefaultRoomLabels.ARCHIVED) &&
        !conversation.labels?.includes(DefaultRoomLabels.MUTE)
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

  onNotificationClick = (roomId: string) => {
    this.props.openNotificationConversation(roomId);
  };

  renderHeaderIcon() {
    return <IconBell1 className={styles.HeaderIcon} size={18} isFilled />;
  }

  renderHeaderTitle() {
    return <div className={styles.HeaderTitle}>Notifications</div>;
  }

  renderNotifications() {
    const { conversations } = this.props;

    return conversations.flatMap((conversation) => {
      const notifications = [];

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

      return notifications;
    });
  }

  renderNoNotifications() {
    return <div className={styles.NoNotifications}>No new notifications</div>;
  }

  renderLoading() {
    return (
      <div className={styles.LoadingContainer}>
        <Spinner />
      </div>
    );
  }

  render() {
    const { conversations, isConversationsLoaded } = this.props;

    const isEmptyState = conversations.length === 0 && isConversationsLoaded;
    const isLoadingState = !isConversationsLoaded;

    return (
      <div className={styles.NotificationsFeed}>
        <div>
          <div className={styles.HeaderContainer}>
            <Header title={this.renderHeaderTitle()} icon={this.renderHeaderIcon()} />
          </div>

          <div className={styles.Body}>
            <ol className={styles.Notifications}>{!isEmptyState && this.renderNotifications()}</ol>

            {isEmptyState && this.renderNoNotifications()}
            {isLoadingState && this.renderLoading()}
          </div>
        </div>
      </div>
    );
  }
}

export const NotificationsFeed = connectContainer<PublicProperties>(Container);
