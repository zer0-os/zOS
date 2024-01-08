import React from 'react';
import { shallow } from 'enzyme';
import { Container } from './container';
import { ErrorDialog } from '.';

describe('Container', () => {
  const subject = (props = {}) => {
    const allProps = {
      onClose: jest.fn(),
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('renders ErrorDialog', () => {
    const wrapper = subject();
    expect(wrapper.find(ErrorDialog).exists()).toBe(true);
  });
});
