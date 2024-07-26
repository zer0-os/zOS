import React from 'react';
import { RootState } from './store/reducer';
import { connectContainer } from './store/redux-container';
import { ThemeEngine } from './components/theme-engine';

import { Sidekick } from './components/sidekick/index';
import { withContext as withAuthenticationContext } from './components/authentication/context';
import { MessengerChat } from './components/messenger/chat';
import { DevPanelContainer } from './components/dev-panel/container';
import { FeatureFlag } from './components/feature-flag';
import { AppBar } from './components/app-bar';
import { DialogManager } from './components/dialog-manager/container';
import { getMainBackgroundVideoSrc } from './utils';

export interface Properties {
  context: {
    isAuthenticated: boolean;
  };
  selectedMainBackground: string;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      background: { selectedMainBackground },
    } = state;

    return { selectedMainBackground };
  }

  static mapActions(_state: RootState): Partial<Properties> {
    return {};
  }

  renderAnimatedBackground(src) {
    return (
      <video key={src} className='main-background-video' autoPlay loop muted>
        <source src={src} type='video/mp4' />
        Your browser does not support the video tag.
      </video>
    );
  }

  render() {
    const videoSrc = getMainBackgroundVideoSrc(this.props.selectedMainBackground);

    return (
      <>
        {this.props.context.isAuthenticated && (
          <>
            {videoSrc && this.renderAnimatedBackground(videoSrc)}

            <DialogManager />
            <AppBar />
            <Sidekick />
            <MessengerChat />
            <Sidekick variant='secondary' />
            <FeatureFlag featureFlag='enableDevPanel'>
              <DevPanelContainer />
            </FeatureFlag>
          </>
        )}
        <ThemeEngine />
      </>
    );
  }
}

export const Main = withAuthenticationContext<{}>(connectContainer<{}>(Container));
