import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';

import { NotificationsFeed } from '../../components/notifications-feed';
import { Provider as AuthenticationContextProvider } from '../../components/authentication/context';
import { ScrollbarContainer } from '../../components/scrollbar-container';
import { Sidekick } from '../../components/sidekick';

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
      <AuthenticationContextProvider value={this.authenticationContext}>
        <div className={styles.NotificationsContainer}>
          <Sidekick />
          <ScrollbarContainer variant='on-hover'>
            <NotificationsFeed />
          </ScrollbarContainer>
          <div />
        </div>
      </AuthenticationContextProvider>
    );
  }
}

export const NotificationsContainer = connectContainer<{}>(Container);
