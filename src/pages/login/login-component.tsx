import React from 'react';
import { Link } from 'react-router-dom';

import { LoginStage } from '../../store/login';
import { Web3LoginContainer } from '../../authentication/web3-login/container';
import { EmailLoginContainer } from '../../authentication/email-login/container';

import ZeroLogo from '../../zero-logo.svg?react';
import { ToggleGroup } from '@zero-tech/zui/components';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { SocialLogin } from '../../authentication/social-login/social-login';
import { assertAllValuesConsumed } from '../../lib/enum';
import { featureFlags } from '../../lib/feature-flags';
import { OTPLogin } from '../../authentication/otp-login/otp-login';

import { bemClassName } from '../../lib/bem';
import './login.scss';

const cn = bemClassName('login-main');

interface LoginComponentProperties {
  isLoggingIn: boolean;
  stage: LoginStage;
  handleSelectionChange: (selectedOption: LoginStage) => void;
}

export class LoginComponent extends React.Component<LoginComponentProperties> {
  renderLoginOption() {
    switch (this.props.stage) {
      case LoginStage.Web3Login:
        return <Web3LoginContainer />;
      case LoginStage.EmailLogin:
        return <EmailLoginContainer />;
      case LoginStage.OTPLogin:
        return <OTPLogin />;
      case LoginStage.SocialLogin:
        return <SocialLogin />;
      default:
        assertAllValuesConsumed(this.props.stage);
    }
  }

  renderToggleGroup(isLoggingIn: boolean, stage: LoginStage) {
    const isOTPLoginEnabled = featureFlags.enableOTPLogin;
    const activeStage = isOTPLoginEnabled && stage === LoginStage.EmailLogin ? LoginStage.OTPLogin : stage;
    const options: { key: LoginStage; label: string }[] = [
      { key: LoginStage.Web3Login, label: 'Web3' },
      { key: isOTPLoginEnabled ? LoginStage.OTPLogin : LoginStage.EmailLogin, label: 'Email' },
    ];
    if (featureFlags.enableSocialLogin) {
      options.push({ key: LoginStage.SocialLogin, label: 'Social' });
    }

    const shouldRenderToggleGroup = stage !== LoginStage.Web3Login || !isLoggingIn;

    return (
      shouldRenderToggleGroup && (
        <ToggleGroup
          {...cn('toggle-group')}
          options={options}
          variant='default'
          onSelectionChange={(selection) => this.props.handleSelectionChange(selection as LoginStage)}
          selection={activeStage}
          selectionType='single'
          isRequired
          isDisabled={isLoggingIn}
        />
      )
    );
  }

  renderFooter(stage: LoginStage) {
    return (
      <div {...cn('other')}>
        <span>
          Not on ZERO? <Link to='/get-access'>Create account</Link>
        </span>
        {stage === LoginStage.EmailLogin && (
          <span>
            Forgot your password? <Link to='/reset-password'>Reset</Link>
          </span>
        )}
      </div>
    );
  }

  render() {
    const { isLoggingIn, stage } = this.props;
    const isWeb3LoginStage = stage === LoginStage.Web3Login;

    return (
      <>
        <ThemeEngine theme={Themes.Dark} />
        <div {...cn('')}>
          <main {...cn('content')}>
            <div {...cn('logo-container')}>
              <ZeroLogo />
            </div>
            <div {...cn('inner-content-wrapper', isLoggingIn && isWeb3LoginStage && 'is-logging-in')}>
              <h3 {...cn('header')}>Log In</h3>
              {this.renderToggleGroup(isLoggingIn, stage)}
              <div {...cn('login-option', isWeb3LoginStage && 'wallet-option')}>{this.renderLoginOption()}</div>
            </div>
            {this.renderFooter(stage)}
          </main>
        </div>
      </>
    );
  }
}
