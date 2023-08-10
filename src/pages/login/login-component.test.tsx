import React from 'react';
import { Link, Redirect } from 'react-router-dom';

import { shallow } from 'enzyme';
import { LoginStage } from '../../store/login';

import { LoginComponent } from './login-component';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { Web3LoginContainer } from '../../authentication/web3-login/container';
import { EmailLoginContainer } from '../../authentication/email-login/container';
import { ToggleGroup } from '@zero-tech/zui/components';

describe('Login Component', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      isLoggingIn: false,
      stage: LoginStage.Web3Login,
      handleSelectionChange: jest.fn(),
      ...props,
    };

    return shallow(<LoginComponent {...allProps} />);
  };

  it('renders Web3LoginContainer by default', () => {
    const wrapper = subject();
    expect(wrapper.find(Web3LoginContainer).exists()).toBeTrue();
    expect(wrapper.find(EmailLoginContainer).exists()).toBeFalse();
    expect(wrapper.find(Redirect).exists()).toBeFalse();
  });

  it('renders EmailLoginContainer when stage is LoginStage.EmailLogin', () => {
    const wrapper = subject({ stage: LoginStage.EmailLogin });
    expect(wrapper.find(Web3LoginContainer).exists()).toBeFalse();
    expect(wrapper.find(EmailLoginContainer).exists()).toBeTrue();
    expect(wrapper.find(Redirect).exists()).toBeFalse();
  });

  it('renders Redirect when stage is LoginStage.Done', () => {
    const wrapper = subject({ stage: LoginStage.Done });
    expect(wrapper.find(Web3LoginContainer).exists()).toBeFalse();
    expect(wrapper.find(EmailLoginContainer).exists()).toBeFalse();
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

  it('calls handleSelectionChange when login option is changed', () => {
    const handleSelectionChange = jest.fn();
    const wrapper = subject({ handleSelectionChange });
    const toggleGroup = wrapper.find(ToggleGroup);
    (toggleGroup.prop('onSelectionChange') as (selectedOption: string) => void)('email');
    expect(handleSelectionChange).toHaveBeenCalledWith('email');
  });

  it('renders "Create account" link and "Reset" button when stage is LoginStage.EmailLogin', () => {
    const wrapper = subject({ stage: LoginStage.EmailLogin });
    expect(wrapper.find(Link).prop('to')).toBe('/get-access');
    expect(wrapper.find('button').text()).toBe('Reset');
  });

  it('renders "Create account" link when stage is LoginStage.Web3Login', () => {
    const wrapper = subject({ stage: LoginStage.Web3Login });
    expect(wrapper.find(Link).prop('to')).toBe('/get-access');
    expect(wrapper).not.toHaveElement('button');
  });

  it('renders "Login" button when stage is LoginStage.ResetPassword', () => {
    const wrapper = subject({ stage: LoginStage.ResetPassword });
    expect(wrapper.find('button').text()).toBe('Login');
  });

  it('does not render ToggleGroup when isLoggingIn is true', () => {
    const wrapper = subject({ isLoggingIn: true });
    expect(wrapper).not.toHaveElement(ToggleGroup);
  });

  it('renders ToggleGroup when isLoggingIn is false', () => {
    const wrapper = subject({ isLoggingIn: false });
    expect(wrapper).toHaveElement(ToggleGroup);
  });
});
