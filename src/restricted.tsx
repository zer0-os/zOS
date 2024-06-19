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
            <p>Please accept your ZERO invite on a desktop browser, such as Chrome or Brave.</p>
            <p>
              Once you have registered you can use ZERO on your phone, by downloading from the
              <a {...cn('link')} href={config.appleAppStorePath} target='_blank' rel='noopener noreferrer'>
                {' Apple App Store '}
              </a>
              or
              <a {...cn('link')} href={config.googlePlayStorePath} target='_blank' rel='noopener noreferrer'>
                {' Google Play Store'}
              </a>
              .
            </p>
          </div>
        </div>

        <ThemeEngine />
      </>
    );
  }
}

export const Restricted = withRouter(connectContainer<{}>(Container));
