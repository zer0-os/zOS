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

export interface Properties {
  isMessengerFullScreen: boolean;
  context: {
    isAuthenticated: boolean;
  };
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const layout = state.layout.value;

    if (layout.isMessengerFullScreen) {
      return {
        isMessengerFullScreen: true,
      };
    }

    return {
      isMessengerFullScreen: false,
    };
  }

  static mapActions(_state: RootState): Partial<Properties> {
    return {};
  }

  render() {
    const mainClassName = classNames('main', {
      'sidekick-panel-open': this.props.context.isAuthenticated,
      'messenger-full-screen': this.props.isMessengerFullScreen,
    });

    return (
      <div className={mainClassName}>
        {this.props.context.isAuthenticated && (
          <>
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
