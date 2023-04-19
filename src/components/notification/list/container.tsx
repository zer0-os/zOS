import React from 'react';

import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store/reducer';
import { fetch as fetchNotifications, denormalizeNotifications } from '../../../store/notifications';
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
    const notifications = denormalizeNotifications(state)
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
      const channelText = channelTextFor(notification.data?.chatId, state);
      let senderName = displayName(notification.originUser?.profileSummary);

      return {
        id: notification.id,
        createdAt: notification.createdAt,
        body: `${senderName} mentioned you in ${channelText}`,
        originatingName: senderName,
        originatingImageUrl: notification.originUser?.profileSummary?.profileImage,
        isUnread: notification.isUnread,
      };
    } else if (notification.notificationType === 'chat_channel_message_replied') {
      const channelText = channelTextFor(notification.data?.chatId, state);
      let senderName = displayName(notification.originUser?.profileSummary);

      return {
        id: notification.id,
        createdAt: notification.createdAt,
        body: `${senderName} replied to you in ${channelText}`,
        originatingName: senderName,
        originatingImageUrl: notification.originUser?.profileSummary?.profileImage,
        isUnread: notification.isUnread,
      };
    } else if (notification.notificationType === 'chat_dm_mention') {
      let senderName = displayName(notification.originUser?.profileSummary);
      return {
        id: notification.id,
        createdAt: notification.createdAt,
        body: `${senderName} mentioned you in a conversation`,
        originatingName: senderName,
        originatingImageUrl: notification.originUser?.profileSummary?.profileImage,
        isUnread: notification.isUnread,
      };
    } else if (notification.notificationType === 'chat_dm_message_replied') {
      let senderName = displayName(notification.originUser?.profileSummary);
      return {
        id: notification.id,
        createdAt: notification.createdAt,
        body: `${senderName} replied to you in a conversation`,
        originatingName: senderName,
        originatingImageUrl: notification.originUser?.profileSummary?.profileImage,
        isUnread: notification.isUnread,
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

function displayName(profileSummary) {
  let displayName = [
    profileSummary?.firstName,
    profileSummary?.lastName,
  ]
    .filter((e) => e)
    .join(' ');
  displayName = displayName || 'Someone';
  return displayName;
}

function channelTextFor(channelId: string, state) {
  const { name: channelName } = denormalizeChannel(channelId, state) || {};
  const channelText = channelName ? `#${channelName}` : 'a channel';
  return channelText;
}
