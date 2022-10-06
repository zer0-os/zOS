/**
 * @jest-environment jsdom
 */

import React from 'react';
import { mount } from 'enzyme';
import { Authenticated } from './authenticated';
import { AuthenticationContext } from '../../context/authentication';

describe('Authentication', () => {
  const ChildComponent = () => null;

  const subject = (props: any = {}, context = {}) => {
    const allProps = {
      ...props,
    };

    return mount(
      <AuthenticationContext.Provider value={{ ...context }}>
        <Authenticated {...allProps}>
          <ChildComponent />
        </Authenticated>
      </AuthenticationContext.Provider>
    );
  };

  it('show when user is authenticated', () => {
    const wrapper = subject({ show: true }, { isAuthenticated: true });

    expect(wrapper.find(ChildComponent).exists()).toBeTruthy();
  });

  it('show when user is authenticated and props are implicit', () => {
    const wrapper = subject({}, { isAuthenticated: true });

    expect(wrapper.find(ChildComponent).exists()).toBeTruthy();
  });

  it('does not show when user is not authenticated', () => {
    const wrapper = subject({ show: true }, { isAuthenticated: false });

    expect(wrapper.find(ChildComponent).exists()).toBeFalsy();
  });

  it('does not show when user is not authenticated and props are implicit', () => {
    const wrapper = subject({}, { isAuthenticated: false });

    expect(wrapper.find(ChildComponent).exists()).toBeFalsy();
  });

  it('hide when user is authenticated', () => {
    const wrapper = subject({ hide: true }, { isAuthenticated: true });

    expect(wrapper.find(ChildComponent).exists()).toBeFalsy();
  });

  it('does not hide when user is not authenticated', () => {
    const wrapper = subject({ hide: true }, { isAuthenticated: false });

    expect(wrapper.find(ChildComponent).exists()).toBeTruthy();
  });

  it('explodes when both props hide and show are defined', () => {
    expect(() => {
      subject({ hide: true, show: false }, { isAuthenticated: false });
    }).toThrow('Both props show and hide were defined, please choose one.');
  });
});
