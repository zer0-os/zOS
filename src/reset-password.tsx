import React from 'react';

import { RootState } from './store/reducer';
import { connectContainer } from './store/redux-container';
// import { RequestPasswordResetContainer } from './authentication/request-password-reset/container';
import { ConfirmPasswordResetContainer } from './authentication/confirm-password-reset/container';

import { ReactComponent as ZeroLogo } from './zero-logo.svg';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';

import { bemClassName } from './lib/bem';
import './reset-password.scss';

const cn = bemClassName('reset-password-main');

export interface Properties {
  shouldRender: boolean;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { pageload } = state;
    return {
      shouldRender: pageload.isComplete,
    };
  }

  static mapActions() {
    return {};
  }

  render() {
    if (!this.props.shouldRender) {
      return null;
    }

    return (
      <>
        <ThemeEngine theme={Themes.Dark} />
        <div {...cn('')}>
          <div {...cn('logo-container')}>
            <ZeroLogo />
          </div>

          {/* <RequestPasswordResetContainer /> */}
          <ConfirmPasswordResetContainer />
        </div>
      </>
    );
  }
}

export const ResetPassword = connectContainer<{}>(Container);
