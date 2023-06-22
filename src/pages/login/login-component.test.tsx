import React from 'react';
import { Link, Redirect } from 'react-router-dom';

import { shallow } from 'enzyme';
import { LoginStage } from '../../store/login';

import { LoginComponent } from './login-component';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { Web3LoginContainer } from '../../authentication/web3-login/container';
import { EmailLoginContainer } from '../../authentication/email-login/container';

describe('Login Component', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      isLoggingIn: false,
      onToggleLoginOption: jest.fn(),
      ...props,
    };

    return shallow(<LoginComponent {...allProps} />);
  };

  it('renders EmailLoginContainer by default', () => {
    const wrapper = subject();
    expect(wrapper.find(EmailLoginContainer).exists()).toBeTrue();
    expect(wrapper.find(Web3LoginContainer).exists()).toBeFalse();
    expect(wrapper.find(Redirect).exists()).toBeFalse();
  });

  it('renders Web3LoginContainer when stage is LoginStage.Web3Login', () => {
    const wrapper = subject({ stage: LoginStage.Web3Login });
    expect(wrapper.find(EmailLoginContainer).exists()).toBeFalse();
    expect(wrapper.find(Web3LoginContainer).exists()).toBeTrue();
    expect(wrapper.find(Redirect).exists()).toBeFalse();
  });

  it('renders Redirect when stage is LoginStage.Done', () => {
    const wrapper = subject({ stage: LoginStage.Done });
    expect(wrapper.find(EmailLoginContainer).exists()).toBeFalse();
    expect(wrapper.find(Web3LoginContainer).exists()).toBeFalse();
    expect(wrapper.find(Redirect).exists()).toBeTrue();
  });

  it('renders ThemeEngine', () => {
    const wrapper = subject();
    expect(wrapper.find(ThemeEngine).exists()).toBeTrue();
  });

  it('sets theme to Themes.Dark', () => {
    const wrapper = subject();
    expect(wrapper.find(ThemeEngine).prop('theme')).toBe(Themes.Dark);
  });

  it('calls onToggleLoginOption when login option button is clicked', () => {
    const onToggleLoginOption = jest.fn();
    const wrapper = subject({ onToggleLoginOption });
    wrapper.find('button').simulate('click');
    expect(onToggleLoginOption).toHaveBeenCalled();
  });

  it('renders Link to create an account when isLoggingIn is false', () => {
    const wrapper = subject({ isLoggingIn: false });

    const link = wrapper.find(Link);
    expect(link).toHaveLength(1);
    expect(link.prop('to')).toBe('/get-access');
  });

  it('does not render Link to create an account when isLoggingIn is true', () => {
    const wrapper = subject({ isLoggingIn: true });
    expect(wrapper.find(Link)).toHaveLength(0);
  });
});
