import React from 'react';

import { shallow } from 'enzyme';

import { Channels } from '.';

describe('Channels', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      ...props,
    };

    return shallow(<Channels {...allProps} />);
  };

  it('renders', () => {
    const wrapper = subject();

    expect(wrapper.find('.channels').exists()).toBe(true);
  });
});
