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
import { DialogManager } from './components/dialog-manager/container';
import { getMainBackgroundClass, getMainBackgroundVideoSrc } from './utils';

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
    const backgroundClass = getMainBackgroundClass(this.props.selectedMainBackground);

    const mainClassName = classNames('main', 'messenger-full-screen', backgroundClass, {
      'sidekick-panel-open': this.props.context.isAuthenticated,
      background: this.props.context.isAuthenticated,
    });

    return (
      <div className={mainClassName}>
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
      </div>
    );
  }
}

export const Main = withAuthenticationContext<{}>(connectContainer<{}>(Container));
