import React from 'react';
import { Link, Redirect } from 'react-router-dom';

import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { LoginStage, switchLoginStage } from '../../store/login';

import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { Web3LoginContainer } from '../../authentication/web3-login/container';
import { EmailLoginContainer } from '../../authentication/email-login/container';
import { ReactComponent as ZeroLogo } from '../../zero-logo.svg';

import './login.scss';
import { bem } from '../../lib/bem';

const c = bem('login');

export interface LoginContainerProperties {
  isLoggingIn: boolean;
  stage: LoginStage;
  switchLoginStage: (stage: LoginStage) => void;
}

export class LoginContainer extends React.Component<LoginContainerProperties> {
  static mapState(state: RootState): Partial<LoginContainerProperties> {
    const { login } = state;
    return {
      stage: login.stage,
      isLoggingIn: login.loading,
    };
  }

  static mapActions(_props: LoginContainerProperties): Partial<LoginContainerProperties> {
    return {
      switchLoginStage,
    };
  }

  get loginOptionButtonText() {
    return this.props.stage === LoginStage.Web3Login ? 'Email' : 'Web3 Wallet';
  }

  get handleToggleLoginOption() {
    const { switchLoginStage, stage } = this.props;
    return () => switchLoginStage(stage === LoginStage.Web3Login ? LoginStage.EmailLogin : LoginStage.Web3Login);
  }

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

  render() {
    const { isLoggingIn } = this.props;

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
                  <button onClick={this.handleToggleLoginOption}>{this.loginOptionButtonText}</button>
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

export const Login = connectContainer<{}>(LoginContainer);
