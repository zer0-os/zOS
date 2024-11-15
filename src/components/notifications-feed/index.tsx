import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { Notification } from '../../store/notifications';
import { fetchNotifications, openNotificationConversation } from '../../store/notifications';

import { Header } from '../header';
import { IconBell1 } from '@zero-tech/zui/icons';
import { NotificationItem } from './notification-item';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';

import styles from './styles.module.scss';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  notifications: Notification[];
  loading: boolean;
  error: string | null;

  fetchNotifications: () => void;
  openNotificationConversation: (roomId: string) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      notifications: { items, loading, error },
    } = state;

    return {
      notifications: items,
      loading,
      error,
    };
  }

  static mapActions(): Partial<Properties> {
    return {
      fetchNotifications,
      openNotificationConversation,
    };
  }

  componentDidMount() {
    this.props.fetchNotifications();
  }

  onNotificationClick = (roomId: string) => {
    this.props.openNotificationConversation(roomId);
  };

  getOldestTimestamp(notifications: Notification[] = []): number {
    return notifications.reduce((previousTimestamp, notification: any) => {
      return notification.createdAt < previousTimestamp ? notification.createdAt : previousTimestamp;
    }, Date.now());
  }

  renderHeaderIcon() {
    return <IconBell1 className={styles.HeaderIcon} size={18} isFilled />;
  }

  renderHeaderTitle() {
    return <div className={styles.HeaderTitle}>Notifications</div>;
  }

  renderNotifications() {
    const { notifications } = this.props;

    return notifications.map((notification) => (
      <li key={notification.id}>
        <NotificationItem notification={notification} onClick={this.onNotificationClick} />
      </li>
    ));
  }

  renderNoNotifications() {
    return <div className={styles.NoNotifications}>No notifications</div>;
  }

  renderLoading() {
    return (
      <div className={styles.LoadingContainer}>
        <Spinner />
      </div>
    );
  }

  renderError() {
    return <div className={styles.Error}>{this.props.error}</div>;
  }

  render() {
    const { notifications, loading, error } = this.props;

    return (
      <div className={styles.NotificationsFeed}>
        <div>
          <div className={styles.HeaderContainer}>
            <Header title={this.renderHeaderTitle()} icon={this.renderHeaderIcon()} />
          </div>

          <div className={styles.Body}>
            <ol className={styles.Notifications}>{notifications.length > 0 && this.renderNotifications()}</ol>

            {notifications.length === 0 && !loading && !error && this.renderNoNotifications()}
            {loading && this.renderLoading()}
            {error && !loading && this.renderError()}
          </div>
        </div>
      </div>
    );
  }
}

export const NotificationsFeed = connectContainer<PublicProperties>(Container);
