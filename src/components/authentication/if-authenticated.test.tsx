import React from 'react';
import { shallow } from 'enzyme';
import { Component as IfAuthenticated } from './if-authenticated';

describe('IfAuthenticated', () => {
  const ChildComponent = () => null;

  const subject = (props: any = {}) => {
    const allProps = {
      ...props,
    };

    return shallow(
      <IfAuthenticated {...allProps}>
        <ChildComponent />
      </IfAuthenticated>
    );
  };

  it('showChildren when user is authenticated', () => {
    const wrapper = subject({ showChildren: true, context: { isAuthenticated: true } });

    expect(wrapper.find(ChildComponent).exists()).toBeTrue();
  });

  it('showChildren when user is authenticated and props are implicit', () => {
    const wrapper = subject({ context: { isAuthenticated: true } });

    expect(wrapper.find(ChildComponent).exists()).toBeTrue();
  });

  it('does not showChildren when user is not authenticated', () => {
    const wrapper = subject({ showChildren: true, context: { isAuthenticated: false } });

    expect(wrapper.find(ChildComponent).exists()).toBeFalse();
  });

  it('does not showChildren when user is not authenticated and props are implicit', () => {
    const wrapper = subject({ context: { isAuthenticated: false } });

    expect(wrapper.find(ChildComponent).exists()).toBeFalse();
  });

  it('explodes when both props hideChildren and showChildren are defined', () => {
    expect(() => {
      subject({ hideChildren: true, showChildren: false, context: { isAuthenticated: false } });
    }).toThrow('Both props showChildren and hideChildren were defined, please choose one.');
  });
});
