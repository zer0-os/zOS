import React from 'react';
import { RootState } from './store/reducer';
import { connectContainer } from './store/redux-container';
import { ThemeEngine } from './components/theme-engine';

import './main.scss';
import classNames from 'classnames';
import { Sidekick } from './components/sidekick/index';
import { withContext as withAuthenticationContext } from './components/authentication/context';
import { MessengerChat } from './components/messenger/chat';
import { DevPanelContainer } from './components/dev-panel/container';
import { FeatureFlag } from './components/feature-flag';
import { AppBar } from './components/app-bar';

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
    const mainClassName = classNames('main', 'messenger-full-screen', {
      'sidekick-panel-open': this.props.context.isAuthenticated,
    });

    return (
      <div className={mainClassName}>
        {this.props.context.isAuthenticated && (
          <>
            <AppBar />
            <Sidekick />
            <MessengerChat />
            <FeatureFlag featureFlag='enableDevPanel'>
              <DevPanelContainer />
            </FeatureFlag>
          </>
        )}

        <ThemeEngine />
      </div>
    );
  }
}

export const Main = withAuthenticationContext<{}>(connectContainer<{}>(Container));
