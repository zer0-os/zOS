import React from 'react';

import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store/reducer';
import { fetch as fetchNotifications, denormalizeNotifications } from '../../../store/notifications';
import { denormalize as denormalizeChannel } from '../../../store/channels';

import { NotificationList } from '.';
import { mapNotification } from '../utils';

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
      .map((n) => {
        const { name: channelName } = denormalizeChannel(n.data?.chatId, state) || {};
        return mapNotification(n, channelName);
      })
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

  componentDidMount() {
    this.props.fetchNotifications({ userId: this.props.userId });
  }

  render() {
    return <NotificationList list={this.props.notifications} />;
  }
}

export const NotificationListContainer = connectContainer<{}>(Container);
