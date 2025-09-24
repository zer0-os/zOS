import React from 'react';
import { withRouter } from 'react-router-dom';
import { connectContainer } from './store/redux-container';
import { ThemeEngine } from './components/theme-engine';
import ZeroLogo from './zero-logo.svg?react';
import { config } from './config';

import { bemClassName } from './lib/bem';

import './restricted.scss';

const cn = bemClassName('restricted');

export class Container extends React.Component {
  static mapState() {
    return {};
  }

  static mapActions() {
    return {};
  }

  render() {
    return (
      <>
        <div {...cn('')}>
          <div {...cn('logo-container')}>
            <ZeroLogo />
          </div>
          <div {...cn('text-container')}>
            <p>Download the app and unlock your invite.</p>
          </div>
          <div {...cn('buttons-container')}>
            <a {...cn('download-button')} href={config.appleAppStorePath} target='_blank' rel='noopener noreferrer'>
              <div {...cn('button-content')}>
                <div {...cn('apple-logo')} />
                <div {...cn('button-text')}>
                  <span>Download on the</span>
                  <span>App Store</span>
                </div>
              </div>
            </a>
            <a {...cn('download-button')} href={config.googlePlayStorePath} target='_blank' rel='noopener noreferrer'>
              <div {...cn('button-content')}>
                <div {...cn('google-play-logo')} />
                <div {...cn('button-text')}>
                  <span>GET IT ON</span>
                  <span>Google Play</span>
                </div>
              </div>
            </a>
          </div>
        </div>

        <ThemeEngine />
      </>
    );
  }
}

export const Restricted = withRouter(connectContainer<{}>(Container));
