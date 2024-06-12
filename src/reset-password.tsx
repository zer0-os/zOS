import React from 'react';
import { withRouter } from 'react-router-dom';
import { RootState } from './store/reducer';
import { connectContainer } from './store/redux-container';
import { RequestPasswordResetContainer } from './authentication/request-password-reset/container';
import { ConfirmPasswordResetContainer } from './authentication/confirm-password-reset/container';

import ZeroLogo from './zero-logo.svg?react';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';

import { bemClassName } from './lib/bem';
import './reset-password.scss';

const cn = bemClassName('reset-password-main');

export interface Properties {
  shouldRender: boolean;
  location: {
    search: string;
  };
  token?: string;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState, ownProps: Properties): Partial<Properties> {
    const { pageload } = state;
    const urlSearchParams = new URLSearchParams(ownProps.location.search);
    const token = urlSearchParams.get('token');
    return {
      shouldRender: pageload.isComplete,
      token,
    };
  }

  static mapActions() {
    return {};
  }

  render() {
    if (!this.props.shouldRender) {
      return null;
    }

    const isTokenValid = !!this.props.token;

    return (
      <>
        <ThemeEngine theme={Themes.Dark} />
        <div {...cn('')}>
          <div {...cn('logo-container')}>
            <ZeroLogo />
          </div>

          {isTokenValid ? (
            <ConfirmPasswordResetContainer token={this.props.token} />
          ) : (
            <RequestPasswordResetContainer />
          )}
        </div>
      </>
    );
  }
}

export const ResetPassword = withRouter(connectContainer<{}>(Container));
