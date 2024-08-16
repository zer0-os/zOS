import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';

import { Sidekick } from '../../components/sidekick/index';
import { withContext as withAuthenticationContext } from '../../components/authentication/context';
import { MessengerChat } from '../../components/messenger/chat';
import { MessengerFeed } from '../../components/messenger/feed';
import { DevPanelContainer } from '../../components/dev-panel/container';
import { FeatureFlag } from '../../components/feature-flag';

import './Main.scss';

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

            <FeatureFlag featureFlag='enableChannels'>
              <MessengerFeed />
            </FeatureFlag>

            <div className={'divider'} />

            <MessengerChat />
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
