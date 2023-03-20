import React from 'react';

import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store';
import { fetch as fetchNotifications, denormalize } from '../../../store/notifications';
import { denormalize as denormalizeChannel } from '../../../store/channels';

import { NotificationList } from '.';

export interface Properties {
  notifications: any[];
  userId: string;
  fetchNotifications: (payload: { userId: string }) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      authentication: { user },
    } = state;
    const notifications = denormalize(state.notificationsList.value, state)
      .map((n) => Container.mapNotification(n, state))
      .filter((n) => !!n);

    return {
      notifications,
      userId: user?.data?.id,
    };
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
      let displayName = [
        notification.originUser?.profileSummary?.firstName,
        notification.originUser?.profileSummary?.lastName,
      ]
        .filter((e) => e)
        .join(' ');
      displayName = displayName || 'Someone';

      return {
        id: notification.id,
        createdAt: notification.createdAt,
        body: `${displayName} mentioned you in ${channelText}`,
        originatingName: displayName,
        originatingImageUrl: notification.originUser?.profileSummary?.profileImage,
      };
    }
    return null;
  }

  componentDidMount() {
    this.props.fetchNotifications({ userId: this.props.userId });
  }

  render() {
    return <NotificationList list={this.props.notifications} />;
  }
}

export const NotificationListContainer = connectContainer<{}>(Container);
