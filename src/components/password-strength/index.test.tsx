import React from 'react';

import { shallow } from 'enzyme';

import { PasswordStrength, Properties } from '.';
import { Strength } from '../../lib/password';

describe('PasswordStrength', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      strength: Strength.None,
      ...props,
    };

    return shallow(<PasswordStrength {...allProps} />);
  };

  it('renders with no password', function () {
    const wrapper = subject({ strength: Strength.None });

    expect(wrapper.prop('data-strength')).toEqual('none');
    const bars = wrapper.find('.password-strength__status-bar');
    expect(bars.map((b) => b.prop('data-status'))).toEqual([
      '',
      '',
      '',
      '',
    ]);
    expect(wrapper.find('.password-strength__strength-text').text()).toEqual('');
  });

  it('renders when password is weak', function () {
    const wrapper = subject({ strength: Strength.Weak });

    expect(wrapper.prop('data-strength')).toEqual('weak');
    const bars = wrapper.find('.password-strength__status-bar');
    expect(bars.map((b) => b.prop('data-status'))).toEqual([
      'filled',
      '',
      '',
      '',
    ]);
    expect(wrapper.find('.password-strength__strength-text').text()).toEqual('weak');
  });

  it('renders when password is acceptable', function () {
    const wrapper = subject({ strength: Strength.Acceptable });

    expect(wrapper.prop('data-strength')).toEqual('acceptable');
    const bars = wrapper.find('.password-strength__status-bar');
    expect(bars.map((b) => b.prop('data-status'))).toEqual([
      'filled',
      'filled',
      '',
      '',
    ]);
    expect(wrapper.find('.password-strength__strength-text').text()).toEqual('acceptable');
  });

  it('renders when password is good', function () {
    const wrapper = subject({ strength: Strength.Good });

    expect(wrapper.prop('data-strength')).toEqual('good');
    const bars = wrapper.find('.password-strength__status-bar');
    expect(bars.map((b) => b.prop('data-status'))).toEqual([
      'filled',
      'filled',
      'filled',
      '',
    ]);
    expect(wrapper.find('.password-strength__strength-text').text()).toEqual('good');
  });

  it('renders when password is strong', function () {
    const wrapper = subject({ strength: Strength.Strong });

    expect(wrapper.prop('data-strength')).toEqual('strong');
    const bars = wrapper.find('.password-strength__status-bar');
    expect(bars.map((b) => b.prop('data-status'))).toEqual([
      'filled',
      'filled',
      'filled',
      'filled',
    ]);
    expect(wrapper.find('.password-strength__strength-text').text()).toEqual('strong');
  });
});
