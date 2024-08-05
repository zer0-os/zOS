import React from 'react';
import { withRouter } from 'react-router-dom';
import { connectContainer } from './store/redux-container';
import { ThemeEngine } from './components/theme-engine';
import ZeroLogo from './zero-logo.svg?react';

import { bemClassName } from './lib/bem';

import './maintenance.scss';

const cn = bemClassName('maintenance');

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
            <p>We are currently performing maintenance.</p>
            <p>Please check back later.</p>
          </div>
        </div>

        <ThemeEngine />
      </>
    );
  }
}

export const Maintenance = withRouter(connectContainer<{}>(Container));
