import React from 'react';
import { shallow } from 'enzyme';

import { LoginContainer } from './login-container';
import { LoginComponent } from './login-component';
import { LoginStage } from '../../store/login';

describe('Login Container', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      shouldRender: true,
      isLoggingIn: false,
      stage: LoginStage.EmailLogin,
      switchLoginStage: jest.fn(),
      ...props,
    };

    return shallow(<LoginContainer {...allProps} />);
  };

  test('renders LoginComponent with correct props', () => {
    const wrapper = subject({ isLoggingIn: false, stage: LoginStage.EmailLogin });
    expect(wrapper.find(LoginComponent).exists()).toBe(true);
    expect(wrapper.find(LoginComponent).prop('isLoggingIn')).toBe(false);
    expect(wrapper.find(LoginComponent).prop('stage')).toBe(LoginStage.EmailLogin);
  });

  test('toggles login option from email to web3', () => {
    const mockToggle = jest.fn();
    const wrapper = subject({
      isLoggingIn: false,
      stage: LoginStage.EmailLogin,
      switchLoginStage: mockToggle,
    });
    wrapper.find(LoginComponent).prop('handleSelectionChange')('web3');
    expect(mockToggle).toHaveBeenCalledWith(LoginStage.Web3Login);
  });

  test('toggles login option from web3 to email', () => {
    const mockToggle = jest.fn();
    const wrapper = subject({
      isLoggingIn: false,
      stage: LoginStage.Web3Login,
      switchLoginStage: mockToggle,
    });
    wrapper.find(LoginComponent).prop('handleSelectionChange')('email');
    expect(mockToggle).toHaveBeenCalledWith(LoginStage.EmailLogin);
  });

  test('should not render login page if loadpage prop is false', () => {
    const wrapper = subject({
      shouldRender: false,
    });
    expect(wrapper.find(LoginComponent).exists()).toBe(false);
  });
});
