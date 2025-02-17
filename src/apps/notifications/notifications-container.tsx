import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';

import { NotificationsFeed } from '../../components/notifications-feed';
import { ConversationsSidekick } from '../../components/sidekick/variants/conversations-sidekick';

import styles from './notifications-container.module.scss';

export interface Properties {
  isAuthenticated: boolean;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    return {
      isAuthenticated: !!state.authentication.user?.data,
    };
  }

  static mapActions() {
    return {};
  }

  get authenticationContext() {
    const { isAuthenticated } = this.props;
    return {
      isAuthenticated,
    };
  }

  render() {
    return (
      <div className={styles.NotificationsContainer}>
        <ConversationsSidekick />
        <NotificationsFeed />
      </div>
    );
  }
}

export const NotificationsContainer = connectContainer<{}>(Container);
