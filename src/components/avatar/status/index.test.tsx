import React from 'react';
import { shallow } from 'enzyme';

import { Status, StatusProps } from './';

describe('Status', () => {
  const subject = (props: Partial<StatusProps>) => {
    const allProps: StatusProps = {
      type: 'active',
      ...props,
    };

    return shallow(<Status {...allProps} />);
  };

  it('renders with the correct status type attribute', () => {
    const wrapper = subject({ type: 'active' });
    expect(wrapper).toHaveProp('data-status-type', 'active');
  });

  it('applies custom className when provided', () => {
    const wrapper = subject({ className: 'custom-class' });
    expect(wrapper).toHaveClassName('custom-class');
  });

  it('renders with idle status type', () => {
    const wrapper = subject({ type: 'idle' });
    expect(wrapper).toHaveProp('data-status-type', 'idle');
  });

  it('renders with busy status type', () => {
    const wrapper = subject({ type: 'busy' });
    expect(wrapper).toHaveProp('data-status-type', 'busy');
  });

  it('renders with offline status type', () => {
    const wrapper = subject({ type: 'offline' });
    expect(wrapper).toHaveProp('data-status-type', 'offline');
  });

  it('renders with unread status type', () => {
    const wrapper = subject({ type: 'unread' });
    expect(wrapper).toHaveProp('data-status-type', 'unread');
  });
});
