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
            <p>Please download the ZERO app to get started with your invite.</p>
            <p>
              You can download ZERO from the
              <a {...cn('link')} href={config.appleAppStorePath} target='_blank' rel='noopener noreferrer'>
                {' Apple App Store '}
              </a>
              or
              <a {...cn('link')} href={config.googlePlayStorePath} target='_blank' rel='noopener noreferrer'>
                {' Google Play Store'}
              </a>
              . Once downloaded, simply enter your invite code to get started.
            </p>
          </div>
        </div>

        <ThemeEngine />
      </>
    );
  }
}

export const Restricted = withRouter(connectContainer<{}>(Container));
