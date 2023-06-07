import React from 'react';

import { Link, Redirect } from 'react-router-dom';
import { LoginStage } from '../../store/login';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { ReactComponent as ZeroLogo } from '../../zero-logo.svg';

import { bem } from '../../lib/bem';
import { Web3LoginContainer } from '../../authentication/web3-login/container';
import { EmailLoginContainer } from '../../authentication/email-login/container';

import './login.scss';

const c = bem('login');

interface LoginComponentProperties {
  isLoggingIn: boolean;
  onToggleLoginOption: () => void;
  stage: LoginStage;
}

export class LoginComponent extends React.Component<LoginComponentProperties> {
  get loginOption() {
    switch (this.props.stage) {
      case LoginStage.Web3Login:
        return <Web3LoginContainer />;
      case LoginStage.Done:
        return <Redirect to='/' />;
      default:
        return <EmailLoginContainer />;
    }
  }

  get loginOptionButtonText() {
    return this.props.stage === LoginStage.Web3Login ? 'Email' : 'Web3 Wallet';
  }

  render() {
    const { isLoggingIn, onToggleLoginOption } = this.props;

    return (
      <>
        <ThemeEngine theme={Themes.Dark} />
        <div className={c('')}>
          <main className={c('content')}>
            <ZeroLogo />
            <h3 className={c('header')}>Log in</h3>
            <div className={c('login')}>{this.loginOption}</div>
            {!isLoggingIn && (
              <>
                <hr />
                <div className={c('options')}>
                  <span>Or login with</span>
                  <button onClick={onToggleLoginOption}>{this.loginOptionButtonText}</button>
                </div>
                <div className={c('other')}>
                  <span>
                    New to ZERO? <Link to='/get-access'>Create an account</Link>
                  </span>
                </div>
              </>
            )}
          </main>
        </div>
      </>
    );
  }
}
