import React from 'react';
import { RootState } from './store/reducer';
import { connectContainer } from './store/redux-container';
import { ReactComponent as ZeroLogo } from './zero-logo.svg';

import './login.scss';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { EmailLoginContainer } from './authentication/email-login/container';

export interface Properties {}

export class Container extends React.Component<Properties> {
  static mapState(_state: RootState): Partial<Properties> {
    return {};
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    return (
      <>
        <ThemeEngine theme={Themes.Dark} />
        <div className='login-main'>
          <ZeroLogo />
          <EmailLoginContainer />
        </div>
      </>
    );
  }
}

export const Login = connectContainer<{}>(Container);
