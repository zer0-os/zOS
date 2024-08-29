import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';

import { Sidekick } from '../../components/sidekick/index';
import { withContext as withAuthenticationContext } from '../../components/authentication/context';
import { MessengerChat } from '../../components/messenger/chat';
import { MessengerFeed } from '../../components/messenger/feed';
import { DevPanelContainer } from '../../components/dev-panel/container';
import { FeatureFlag } from '../../components/feature-flag';

import styles from './Main.module.scss';
import { ConversationHeader } from '../../components/messenger/chat/conversation-header/container';

export interface Properties {
  context: {
    isAuthenticated: boolean;
  };
}

export class Container extends React.Component<Properties> {
  static mapState(_state: RootState): Partial<Properties> {
    return {};
  }

  static mapActions(_state: RootState): Partial<Properties> {
    return {};
  }

  render() {
    return (
      <>
        {this.props.context.isAuthenticated && (
          <>
            <Sidekick />

            <div className={styles.Split}>
              <ConversationHeader className={styles.Header} />

              <FeatureFlag featureFlag='enableChannels'>
                <MessengerFeed />
              </FeatureFlag>

              <MessengerChat />
            </div>
            <Sidekick variant='secondary' />

            <FeatureFlag featureFlag='enableDevPanel'>
              <DevPanelContainer />
            </FeatureFlag>
          </>
        )}
      </>
    );
  }
}

export const Main = withAuthenticationContext<{}>(connectContainer<{}>(Container));
