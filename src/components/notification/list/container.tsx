import React from 'react';

import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store';
import { fetch as fetchNotifications, denormalize } from '../../../store/notifications';
import { NotificationList } from '.';

export interface Properties {
  notifications: any[];
  fetchNotifications: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    return {
      notifications: denormalize(state.notificationsList.value, state),
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      fetchNotifications,
    };
  }

  componentDidMount() {
    this.props.fetchNotifications();
  }

  render() {
    return <NotificationList list={this.props.notifications} />;
  }
}

export const NotificationListContainer = connectContainer<{}>(Container);
