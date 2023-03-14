import React from 'react';

import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store';
import { fetch as fetchNotifications, denormalize } from '../../../store/notifications';
import { denormalize as denormalizeChannel } from '../../../store/channels';

import { NotificationList } from '.';

export interface Properties {
  notifications: any[];
  fetchNotifications: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const notifications = denormalize(state.notificationsList.value, state)
      .map((n) => Container.mapNotification(n, state))
      .filter((n) => !!n);

    return { notifications };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      fetchNotifications,
    };
  }

  static mapNotification(notification, state: RootState) {
    if (notification.notificationType === 'chat_channel_mention') {
      const channelId = notification.data?.chatId;
      const { name: channelName } = denormalizeChannel(channelId, state) || {};
      const channelText = channelName ? `#${channelName}` : 'a channel';

      // This should probably be extracted to a display utility or added
      // to the domain model
      const displayName = [
        notification.originUser?.profileSummary?.firstName,
        notification.originUser?.profileSummary?.lastName,
      ]
        .filter((e) => e)
        .join(' ');

      return {
        id: notification.id,
        createdAt: notification.createdAt,
        title: 'Network Message',
        body: `You were mentioned in ${channelText}`,
        originatingName: displayName,
        originatingImageUrl: notification.originUser?.profileSummary?.profileImage,
      };
    }
    return null;
  }

  componentDidMount() {
    this.props.fetchNotifications();
  }

  render() {
    return <NotificationList list={this.props.notifications} />;
  }
}

export const NotificationListContainer = connectContainer<{}>(Container);
